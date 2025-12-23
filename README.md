<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/temp/1

## Run Locally

**Prerequisites:**  Node.js

1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Implantação na Vercel

Para hospedar este projeto na Vercel, siga estes passos:

1. **Conecte seu repositório** no dashboard da Vercel.
2. **Configuração do Projeto**:
   - **Root Directory**: Defina como `ContractGov`.
   - **Build Command**: `vite build` (padrão).
   - **Output Directory**: `dist` (padrão).
3. **Variáveis de Ambiente**:
   Adicione as seguintes variáveis no painel da Vercel:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `GEMINI_API_KEY`
4. **Deploy**: Clique em "Deploy".

O arquivo `vercel.json` já está configurado para garantir que as rotas do React (SPA) funcionem corretamente.
