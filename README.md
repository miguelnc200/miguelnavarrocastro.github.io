# miguelnc200.github.io

Web personal de Miguel Navarro Castro (HTML + CSS, sin Jekyll).

## Cómo publicarla en GitHub Pages
1. En GitHub, crea un repositorio público llamado exactamente **miguelnc200.github.io**.
2. Sube todos los archivos de esta carpeta (botón *Add file → Upload files*, arrastra todos los archivos; todos van sueltos, sin carpetas).
3. Ve a *Settings → Pages* y comprueba que *Source* es "Deploy from a branch", rama `main`, carpeta `/ (root)`.
4. En uno o dos minutos estará en https://miguelnc200.github.io

## Qué cambiar
- **Texto "about":** en `index.html`, entre `EDIT THE BIO BELOW` y `END OF BIO`.
- **Enlaces sociales:** en `index.html`, bloque `socials`.
- **CV en PDF:** está en `cv.pdf`; si lo actualizas, sustituye ese archivo.
- **Colores y tipografía:** variables al principio de `style.css`.
- **Publicaciones nuevas:** copia un bloque `<li class="pub">…</li>` en `publications.html` (y en `index.html` si quieres destacarla). Las miniaturas son los archivos `delacruz….svg`.
- **Figura interactiva de la colonia:** el código está al final de `main.js` (función `colony`).
