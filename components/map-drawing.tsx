// Mapa desenhado à mão da Casa Nonna. É ilustração, fora de escala: quem vai dirigir usa o
// botão "Como chegar", que abre o mapa de verdade. Os traços se desenham ao entrar na tela.
export function MapDrawing() {
  return (
    <figure className="mapa" data-reveal>
      <svg viewBox="0 0 520 340" aria-labelledby="mapa-title mapa-desc">
        <title id="mapa-title">Mapa ilustrado até a Casa Nonna</title>
        <desc id="mapa-desc">
          Desenho à mão de duas ruas que se cruzam, com a Casa Nonna marcada na Rua 24 de Outubro,
          número 788, no bairro Popular, em Cuiabá.
        </desc>
        <g className="mapa-ruas">
          <path d="M8,214 C120,206 180,222 250,214 C330,205 410,218 512,208" />
          <path d="M14,232 C122,224 182,240 250,232 C332,223 412,236 508,226" />
          <path d="M196,336 C204,286 192,242 200,214 C208,182 196,120 206,8" />
          <path d="M214,336 C222,286 210,242 218,214 C226,182 214,120 224,8" />
        </g>
        <g className="mapa-quadras">
          <path d="M60,120 h96 v62 h-96 z" />
          <path d="M282,110 h120 v74 h-120 z" />
          <path d="M64,268 h92 v52 h-92 z" />
        </g>
        <g className="mapa-arvores">
          <path d="M300,250 v-24 M300,232 l-11,-9 M300,238 l12,-10" />
          <path d="M344,262 v-26 M344,242 l-12,-10 M344,250 l13,-11" />
          <path d="M118,96 v-22 M118,80 l-10,-9 M118,86 l11,-9" />
        </g>
        <g className="mapa-caminho">
          <path d="M470,318 C420,300 372,288 340,272 C310,258 284,250 262,244" />
        </g>
        <g className="mapa-lugar">
          <path d="M258,268 l30,-22 l30,22 v34 h-60 z" />
          <path d="M276,302 v-20 h16 v20" />
          <path d="M244,238 l22,20 M266,238 l-22,20" />
        </g>
        <g className="mapa-bussola">
          <path d="M452,86 v-44 M452,42 l-9,14 M452,42 l9,14" />
          <circle cx="452" cy="96" r="4" />
        </g>
        <text className="mapa-n" x="452" y="30">
          N
        </text>
        <text className="mapa-rua" x="366" y="200" transform="rotate(-2 366 200)">
          Rua 24 de Outubro
        </text>
        <text className="mapa-bairro" x="96" y="196">
          Popular
        </text>
        <text className="mapa-casa" x="288" y="322">
          Casa Nonna · 788
        </text>
      </svg>
    </figure>
  );
}
