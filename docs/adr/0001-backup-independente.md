# ADR 0001 — Backup independente no domínio pessoal

Status: aceito e aplicado em 05/09/2026 (America/Cuiaba).

O usuário solicitou o backup exato `https://luisfellipe.com/convite-luis-raquel/`. Após associar o domínio principal ao GitHub, essa rota devolvia 301 para `luiseraquel.com`, mesmo com a cópia física publicada no user site.

Decisão: manter o artefato T010 aprovado em `convite-luis-raquel/` no repositório pessoal e renomear o repositório principal para `luiseraquel.com`. O ID `R_kgDOUPvCrw`, o domínio próprio, o certificado e a opção HTTPS obrigatório permaneceram iguais. Nenhum registro DNS foi alterado para corrigir essa colisão de rota.

O GitHub documenta que o domínio próprio preserva a URL pública durante o renomeio; as URLs de projeto são a exceção ao redirecionamento automático de repositório. Fonte: https://docs.github.com/en/repositories/creating-and-managing-repositories/renaming-a-repository.

Verificação: publicação principal concluída; cópia pessoal publicada; backup respondeu HTTPS 200 sem redirecionar ao principal, com 15 recursos acessíveis e metadados no próprio endereço. Os arquivos PDF, ICS e a capa B mantiveram seus bytes aprovados. A página pessoal e seu CNAME ficaram fora do diff.

Consequência: o backup é um snapshot independente; mudanças futuras exigem publicação explícita em ambas as cópias. A fonte principal fica neste repositório e o artefato entra em `gh-pages`; a cópia de backup tem o prefixo `/convite-luis-raquel` no domínio pessoal.
