/* Site kök dizinindeki tüm dosyaları tarar ve dosyalar.json'u üretir.
   Geliştirici sayfası bu listeyi okuyup tek tek bağlantı ve toplu ZIP sunar.
   Çalıştırmak için: node tools/manifest.mjs   (depo kökünden) */
import { readdir, stat, writeFile } from 'node:fs/promises';
import { join, relative, extname } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname;
const SKIP = new Set(['.git', 'node_modules', 'tools', '.vercel', '.DS_Store']);
const GROUP = p =>
  p.startsWith('assets/') ? 'Paylaşılan varlıklar'
  : p.startsWith('onboarding/') ? 'Onboarding akışı'
  : p.startsWith('splash/') ? 'Açılış akışı'
  : p.startsWith('tanitim/') ? 'Tanıtım akışı'
  : 'Kök';

async function walk(dir, out = []) {
  for (const name of await readdir(dir)) {
    if (SKIP.has(name)) continue;
    const full = join(dir, name);
    const s = await stat(full);
    if (s.isDirectory()) await walk(full, out);
    else out.push({ path: relative(ROOT, full), size: s.size, ext: extname(name).slice(1).toLowerCase() });
  }
  return out;
}

const files = (await walk(ROOT)).filter(f => f.path !== 'dosyalar.json').sort((a, b) => a.path.localeCompare(b.path, 'tr'));
for (const f of files) f.group = GROUP(f.path);
const total = files.reduce((a, f) => a + f.size, 0);
await writeFile(join(ROOT, 'dosyalar.json'), JSON.stringify({
  olusturuldu: new Date().toISOString().slice(0, 10), adet: files.length, toplamBayt: total, dosyalar: files
}, null, 2) + '\n');
console.log(`dosyalar.json yazıldı: ${files.length} dosya, ${(total / 1048576).toFixed(1)} MB`);
