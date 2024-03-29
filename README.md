# NimoTV Bot

## Infelizmente a NimoTV foi descontinuada no Brasil, então não estarei mais atualizando o bot para as versões mais atuais da "API" da Nimo. Estarei deixando ambas as versões que criei (NodeJS e C#) disponíveis.

<p align="center">
  <img width="250" height="250" src="https://victti.github.io/bot%20icon.png">
</p>

#### Nada deste repositório, ferramenta, nem o dono do repositório é afiliado, patrocinado ou autorizado pela NimoTV ou seus afiliados.
##### Essa ferramenta foi usada como bot de moderação dos canais em que eu trabalhei como mod na Nimo. Eu não sou responsável pelo o que as pessoas irão fazer a partir desse bot.

## Sobre
Este é um bot para a NimoTV, com o propósito de usar comandos melhores na plataforma, já que a mesma não dispõe comandos para elo no lol, nem contadores de uso de comandos. O bot foi feito a partir de um código feito para <a href="https://github.com/franciscojr-dev/websocket-nimotv">análise em tempo real de transmissões na Nimo</a>.

- Ultima vez testado em 28/02/2022

## Recursos
- Infinitos comandos personalizados, com no máximo 100 caracteres (limite imposto pela própria Nimo para usuários).
  - Comandos com contadores.
    - Use `${count}` em um comando para ter um contador.
  - Comandos padrão:
    - <b>!comandos</b>: mostra todos os comandos da live.
    - <b>!uptime</b>: mostra a quanto tempo a live está off/on.
    - <b>!elo</b>: mostra o elo do League of Legends.
    - <b>!wr</b>: mostra o winrate do League of Legends.
    - <b>!lastgame</b>: mostra se você ganhou ou perdeu o último jogo, com o que você jogou e seu KDA do League of Legends.
    - <b>!challenger</b>: mostra quantos pontos faltam para o Challenger no League of Legends (a conta precisa estar Mestre+ para o bot calcular os PDLs).
- Timers que mandam uma mensagem a cada X segundos.
- Pode ser usado em infinitos canais.

## Como usar

1. Abra o painel de desenvolvedor do seu navegador e vá na aba Application
2. Em Local Storage do site da Nimo adicione a variável `_logLevel` com o valor `-6`.
3. Pegue os dados necessários para o bot na aba Console.
4. Vá na página <a href="https://www.nimo.tv/i/my-subscribe">https://www.nimo.tv/i/my-subscribe</a> e vá na aba Network do painel de desenvolvedor do seu navegador
5. Procure pelo `fetch` da página `followListForWeb` e pegue o payload `Body` e coloque nas config do bot. 

## Créditos
- <a href="https://github.com/franciscojr-dev">Francisco Júnior</a>
