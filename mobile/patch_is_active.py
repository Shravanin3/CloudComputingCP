from pathlib import Path
base = Path(r'd:\projects\clg sem 5\CC\cc_courseproject\mobile\src')

t = base / 'types' / 'product.ts'
c = t.read_text('utf-8')
if 'isActive?: boolean;' not in c:
    c = c.replace('lowStockThreshold?: number;', 'lowStockThreshold?: number; isActive?: boolean;')
    t.write_text(c, 'utf-8')

ps = base / 'services' / 'products' / 'productService.ts'
psc = ps.read_text('utf-8')
psc = psc.replace("name !== 'DEACTIVATED'", 'isActive !== false')
psc = psc.replace("name = 'DEACTIVATED'", 'isActive = false')
psc = psc.replace("as Product;", ", isActive: true } as Product;")
ps.write_text(psc, 'utf-8')

print('Patched type and service')
