# 🚀 Deployment Guide - Student Administration System

## Metode 1: Vercel (Anbefalet - Super nemt!)

### Trin 1: Forbered dit projekt
✅ Jeg har allerede lavet `vercel.json` filen for dig

### Trin 2: Push til GitHub (hvis ikke allerede gjort)
```bash
git add .
git commit -m "Prepare for deployment"
git push origin main
```

### Trin 3: Deploy på Vercel
1. Gå til [vercel.com](https://vercel.com)
2. Klik "Sign Up" og log ind med GitHub
3. Klik "New Project"
4. Vælg dit GitHub repository
5. Klik "Deploy"

**Det er det! Din side vil være live på en URL som: `https://your-project-name.vercel.app`**

---

## Metode 2: Netlify (Alternativ)

### Drag & Drop metode (Hurtigst):
1. Kør `npm run build` i dit projekt
2. Gå til [netlify.com](https://netlify.com) 
3. Træk `dist` mappen til Netlify
4. Din side er live!

### GitHub integration:
1. Log ind på Netlify med GitHub
2. Klik "New site from Git"
3. Vælg dit repository
4. Build command: `npm run build`
5. Publish directory: `dist`
6. Deploy!

---

## Metode 3: GitHub Pages

### Automatisk deployment med GitHub Actions:
Jeg kan lave en GitHub Action der automatisk deployer når du pusher til main branch.

---

## 🎯 Min anbefaling

**Start med Vercel** - det er:
- Hurtigst at sætte op
- Bedst performance 
- Automatisk deploys når du pusher til GitHub
- Gratis custom domain

### Efter deployment kan dine kollegaer:
- ✅ Teste dark/light mode toggle
- ✅ Prøve sortering på tabellen  
- ✅ Se elev details modal
- ✅ Redigere elever
- ✅ Teste alle funktioner

### Vil du have mig til at hjælpe med deployment?
Jeg kan guide dig igennem specifikke trin eller lave flere konfigurationsfiler hvis nødvendigt!
