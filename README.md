# Luis e Raquel — convite digital

Convite do casamento em 14 de novembro de 2026, às 19h30, na Casa Nonna, Cuiabá.

Site principal: https://luiseraquel.com

Esta cópia pública contém o código e os arquivos atuais do convite. O histórico de trabalho anterior não integra este repositório.

## Desenvolvimento

Use Node 22.22.0:

```sh
npm ci
npm run dev
npm run build
node --test tests/invitation.test.ts
python tests/pages_contract.py
```

O resultado para publicação fica em `dist/pages`. O build prepara automaticamente a estrutura de arquivos que corresponde ao prefixo da página. A publicação GitHub Pages usa a branch `gh-pages`, na raiz, sem Jekyll. A branch `main` contém o código-fonte.

`site.config.ts` define o domínio e o prefixo dos endereços. Enquanto o convite usar uma página de projeto, o prefixo é `/convite-luis-raquel`; o GitHub herda `luisfellipe.com` do site pessoal da conta. Este repositório não altera aquele site nem seu DNS.

## Domínio próprio

Antes de migrar `luiseraquel.com`, valide esta cópia; verifique o domínio no GitHub; ajuste `site.config.ts` para o domínio definitivo e prefixo vazio; reconstrua; configure o domínio em Pages; só então altere DNS e confira HTTPS. A configuração atual de `luiseraquel.com` permanece na hospedagem existente durante os testes.

## Confirmação de presença

O convidado informa nome e recado, escolhe Luis ou Raquel e abre o WhatsApp com a mensagem pronta. Precisa tocar **Enviar** no WhatsApp. O site não envia mensagens automaticamente e não armazena os dados do formulário.

## Publicação

Depois de validar um build, publique somente o conteúdo de `dist/pages` na branch `gh-pages`; o arquivo `.nojekyll` já integra essa pasta. Nunca copie arquivos locais, credenciais ou o histórico de outra pasta.

A capa original permanece com 1080×1920 e 775385 bytes. Testes de compressão ocorrem no host principal e não comprovam comportamento em aparelhos sem a verificação do usuário.
