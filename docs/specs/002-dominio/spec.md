# Domínio definitivo — luiseraquel.com

## Escopo e aceite

O usuário solicitou a publicação no GitHub para associar `luiseraquel.com` e perguntou sobre a etapa definitiva. A sessão autenticada permite concluir a configuração.

- WHEN o convidado abre `https://luiseraquel.com/`, THE GitHub Pages SHALL servir o convite aprovado na raiz, com recursos locais, PDF, agenda e confirmação funcionais.
- THE configuração SHALL limitar-se ao domínio do casamento e ao repositório `luisfellipe14/luiseraquel.com` (nome anterior `convite-luis-raquel`; mesmo ID). A ordem posterior T012 autoriza somente a pasta de backup `convite-luis-raquel/` no repositório pessoal.
- THE prévia SHALL manter o JPEG B de 1080×1920 e 531730 bytes validado pelo usuário em iPhone e Android.
- THE domínio SHALL possuir a verificação TXT do GitHub, associação Pages, DNS autoritativo correto e HTTPS válido; a entrega distinguirá configuração aplicada de caches externos pendentes.
- THE publicação SHALL preservar o site pessoal e a hospedagem anterior durante a transição.

## Plano T011

1. Registrar o estado DNS anterior e gerar a verificação de propriedade no GitHub.
2. Preparar origem `https://luiseraquel.com`, prefixo vazio e `CNAME` no artefato; validar build e contratos.
3. Publicar o código e o artefato no repositório dedicado; associar o domínio antes de trocar DNS.
4. Substituir os A do apex pelos quatro endereços oficiais GitHub Pages; apontar `www` diretamente a `luisfellipe14.github.io`.
5. Conferir DNS autoritativo, emissão do certificado, HTTPS, HTML, arquivos e prévia. Ativar HTTPS obrigatório quando disponível.

Reversão: restaurar os registros A anteriores (162.159.143.30 e 172.66.3.26) e o CNAME `www` anterior. A versão Sites continua ativa; não excluir seu vínculo durante a transição.

Fontes: [domínio no Pages](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site), [verificação de domínio](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/verifying-your-custom-domain-for-github-pages).
