import json, struct, sys, os, glob
import numpy as np
from PIL import Image

CT = {5120: np.int8, 5121: np.uint8, 5122: np.int16, 5123: np.uint16, 5125: np.uint32, 5126: np.float32}
NC = {'SCALAR': 1, 'VEC2': 2, 'VEC3': 3, 'VEC4': 4}

def read_glb(p):
    b = open(p, 'rb').read()
    jl = struct.unpack('<I', b[12:16])[0]
    j = json.loads(b[20:20 + jl])
    o = 20 + jl
    bl = struct.unpack('<I', b[o:o + 4])[0]
    return j, bytearray(b[o + 8:o + 8 + bl])

def write_glb(p, j, binb):
    while len(binb) % 4: binb += b'\0'
    j['buffers'] = [{'byteLength': len(binb)}]
    js = json.dumps(j, separators=(',', ':')).encode()
    while len(js) % 4: js += b' '
    out = struct.pack('<III', 0x46546C67, 2, 12 + 8 + len(js) + 8 + len(binb))
    out += struct.pack('<II', len(js), 0x4E4F534A) + js + struct.pack('<II', len(binb), 0x004E4942) + bytes(binb)
    open(p, 'wb').write(out)

def acc_data(j, binb, ai):
    a = j['accessors'][ai]; bv = j['bufferViews'][a['bufferView']]
    n = NC[a['type']]; dt = np.dtype(CT[a['componentType']])
    off = bv.get('byteOffset', 0) + a.get('byteOffset', 0)
    stride = bv.get('byteStride', n * dt.itemsize)
    arr = np.zeros((a['count'], n), dtype=np.float64)
    for i in range(a['count']):
        arr[i] = np.frombuffer(binb, dtype=dt, count=n, offset=off + i * stride)
    if a.get('normalized'):
        arr = arr / float(np.iinfo(dt).max)
    return arr

def srgb_to_lin(c):
    return np.where(c <= 0.04045, c / 12.92, ((c + 0.055) / 1.055) ** 2.4)

imgcache = {}
def bake(p):
    j, binb = read_glb(p)
    if not j.get('images'):
        return False
    d = os.path.dirname(p)
    imgs = []
    for im in j['images']:
        ip = os.path.join(d, im['uri'])
        if ip not in imgcache:
            imgcache[ip] = np.asarray(Image.open(ip).convert('RGBA'), dtype=np.float64) / 255.0
        imgs.append(imgcache[ip])
    for m in j['meshes']:
        for pr in m['primitives']:
            mi = pr.get('material')
            if mi is None: continue
            mat = j['materials'][mi]
            pbr = mat.get('pbrMetallicRoughness', {})
            bt = pbr.get('baseColorTexture')
            if not bt or 'TEXCOORD_0' not in pr['attributes']: continue
            img = imgs[j['textures'][bt['index']]['source']]
            uv = acc_data(j, binb, pr['attributes']['TEXCOORD_0'])
            tr = bt.get('extensions', {}).get('KHR_texture_transform')
            if tr:
                uv = uv * np.array(tr.get('scale', [1, 1])) + np.array(tr.get('offset', [0, 0]))
            h, w = img.shape[:2]
            x = np.clip((np.mod(uv[:, 0], 1.0) * w).astype(int), 0, w - 1)
            y = np.clip((np.mod(uv[:, 1], 1.0) * h).astype(int), 0, h - 1)
            col = srgb_to_lin(img[y, x, :3]).astype(np.float32)
            f = np.array(pbr.get('baseColorFactor', [1, 1, 1, 1])[:3], dtype=np.float32)
            col = col * f
            while len(binb) % 4: binb += b'\0'
            off = len(binb); binb += col.tobytes()
            j['bufferViews'].append({'buffer': 0, 'byteOffset': off, 'byteLength': col.nbytes, 'target': 34962})
            j['accessors'].append({'bufferView': len(j['bufferViews']) - 1, 'componentType': 5126, 'count': len(col), 'type': 'VEC3'})
            pr['attributes']['COLOR_0'] = len(j['accessors']) - 1
    for mat in j.get('materials', []):
        pbr = mat.setdefault('pbrMetallicRoughness', {})
        pbr.pop('baseColorTexture', None)
        pbr['baseColorFactor'] = [1, 1, 1, pbr.get('baseColorFactor', [1, 1, 1, 1])[3]]
    for k in ('images', 'textures', 'samplers'):
        j.pop(k, None)
    eu = [e for e in j.get('extensionsUsed', []) if e != 'KHR_texture_transform']
    if eu: j['extensionsUsed'] = eu
    else: j.pop('extensionsUsed', None)
    j.pop('extensionsRequired', None)
    write_glb(p, j, binb)
    return True

root = sys.argv[1]
n = 0
for p in glob.glob(os.path.join(root, '*', '*.glb')):
    try:
        if bake(p): n += 1
    except Exception as e:
        print('FAIL', p, e)
print('baked', n)
