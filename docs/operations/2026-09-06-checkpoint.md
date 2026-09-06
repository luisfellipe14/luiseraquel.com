# Checkpoint — 2026-09-06

## Decisão de encerramento

O usuário relatou que o site abre, mas a prévia no WhatsApp perdeu a imagem. Após o diagnóstico de DNS, decidiu aguardar: “acho que é conexão” e “falta esperar”. A ordem seguinte foi “salve e commit, vou sair”. Nenhuma alteração de código, imagem, metadados ou hospedagem ocorreu após esse relato.

## Publicação preservada

- Principal: https://luiseraquel.com/ — GitHub Pages, repositório `luisfellipe14/luiseraquel.com`, fonte em `main`, publicação em `gh-pages`.
- Backup independente: https://luisfellipe.com/convite-luis-raquel/ — pasta `convite-luis-raquel/` do repositório `luisfellipe14/luisfellipe14.github.io`. A cópia abre sem redirecionamento, com recursos e metadados no próprio endereço. Atualizações futuras exigem publicação separada do backup.
- Hospedagem anterior preservada: https://luis-e-raquel-14-11-2026.l-fellipe-r.chatgpt.site/. Seus metadados sociais apontam para `luiseraquel.com`; a imagem de prévia dessa hospedagem depende do domínio principal.
- Últimos commits de publicação: principal `cb1c753`, backup `77c24fa`; fonte principal antes deste checkpoint `570f37a`.

## Evidência da sessão

1. O domínio principal apresentou timeout no Chrome e no acesso HTTPS normal deste computador. O DNS local devolveu o IP antigo da HostGator, `162.240.81.81`.
2. Os servidores autoritativos, Google e Cloudflare devolveram os quatro IPs do GitHub Pages. O acesso direto ao GitHub, com o nome do domínio e validação normal de TLS, respondeu HTTP 200.
3. O roteador posteriormente passou a devolver os IPs corretos, mas o Windows ainda conservou o endereço antigo em cache. Após `Clear-DnsClientCache`, a resolução normal devolveu os quatro IPs corretos e o download normal de `https://luiseraquel.com/og-capa-1080-v3.jpg` respondeu HTTP 200, `image/jpeg`, 531730 bytes e validação TLS sem erro.
4. O backup abriu o convite completo no Chrome. O backup e a hospedagem anterior também responderam HTTP 200 com metadados sociais completos a uma requisição com User-Agent do WhatsApp. Isso verifica a resposta HTTP ao identificador; não reproduz o aplicativo.
5. A API do GitHub confirmou publicação `built`, domínio verificado, HTTPS obrigatório e certificado aprovado para `luiseraquel.com` e `www.luiseraquel.com`, com expiração informada em 2026-12-04.

Os resultados acima são um registro pontual da sessão, não monitoramento de disponibilidade. Não houve confirmação final da miniatura no WhatsApp após a limpeza de DNS; o cache do telefone e o mecanismo interno do WhatsApp não foram inspecionados. O diagnóstico local não prova a causa específica do telefone.

## Capa aprovada

- Arquivo em uso: `og-capa-1080-v3.jpg`, JPEG B, 1080×1920, 531730 bytes.
- SHA-256: `729556d1b07e3a2da116fbe603cec5eadc2c8152bc44496d641183aa8bede363`.
- O usuário confirmou anteriormente que o teste B funcionou em iPhone e Android; o teste A funcionou apenas no iPhone.
- A arte original, o PDF e a versão B permanecem preservados. Não reduzir a resolução nem trocar a capa por tentativa sem nova evidência.

## Retomada

1. Respeitar a decisão de aguardar a atualização dos caches.
2. Confirmar a miniatura em uma nova mensagem do WhatsApp nos dois aparelhos. Colar o endereço e aguardar a prévia antes do envio; nenhuma confirmação foi enviada pelo agente.
3. Se a falha persistir, registrar o link exato, o aparelho, a rede e o comportamento observado; verificar HTML e imagem por esse caminho antes de alterar a publicação.
4. Manter o backup independente ativo. Não repetir a configuração de domínio nem renomear o repositório: essas etapas já foram concluídas.
