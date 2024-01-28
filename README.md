# Vanilla Javascript Flappy Bird game - Voice controlled
 ```javascript
console.log("Flappy Bird game, maar met een twist: gebruik je microfoon om de game te besturen");
```
Link naar de game site: [JS Flappy Bird game](https://sf-duijkersloot.github.io/JS-Flappy-Bird-game/)

###### *Note : Browser zal wel vragen om toestemming voor de microfoon. Dit is niet noodzakelijk om de game te spelen, maar maakt het wel extra leuk :)*
###### *Note<sup>2</sup> : De game speed kan wat langzaam zijn, de pipes worden gemaakt om de 200 frames. Als het langzaam runned, komt het door een iets lagere fps, mijn excuses daarvoor*

<hr>

### 🏆 Dit project was genomineerd voor de CMD Golden Dot awards 2023 | [Link naar nominatie](https://cmd-amsterdam.nl/portfolio/flappy-bird-voice-controlled/)

<hr>

## De opdracht
Voor het vak **Inleiding Programmeren** kreeg ik de opdracht om een browsergame te ontwikkelen, zoals een Tamagotchi-game of bijvoorbeeld een Snake game. De enige vereiste was dat de game volledig gebouwd moest worden met vanilla JavaScript.


### Werking van de game
  Je hebt 2 verschillende modes om de game te spelen:
  <details>
   <summary><b>Audio Bar Height</b></summary>
  <ul>
   <li>Deze mode laat de vogel de hoogte aannemen op basis van het geluid volume dat je microfoon opneemt. 
    <ul>
    <li>Vb. Als de audio bar aan de linker kant halverwege "vol" is, dan zal de vogel op de helft van de hoogte zitten in het spel.</li>
    </ul>
   </li>
  </ul>
  </details>
  <details>
   <summary><b>Threshold Jump</b></summary>
  <ul>
   <li>In deze mode laat de vogel één keer springen als de geluid threshold wordt gehaald. 
    <ul>
    <li>Je hebt een upper en lower threshold, als het geluid boven de upper threshold komt dan zal de vogel springen. Vervolgens zal de jump "gereset" worden als het geluid onder de lower threshold komt, zonder dit zou de vogel continu blijven stijgen als het boven de threshold kwam, dit was niet mijn visie (de thresholds kan je aanpassen met de sliders)</li>
    </ul>
   </li>
  </ul>
  </details>

<hr>

## Resultaat
Tijdens het vak Inleiding Programmeren heb ik met mijn beperkte ervaring in JavaScript de bekende Flappy Bird-game ontwikkeld voor browsers. Na het maken van de basisgame, voelde ik dat er iets ontbrak, gezien het spel al vaak genoeg is gemaakt. Om het interessanter te maken, heb ik besloten om een interactief element toe te voegen: een besturing met je stem. Deze functie kan eenvoudig worden in- en uitgeschakeld, zodat spelers kunnen kiezen tussen stembesturing en de reguliere bediening. De stembesturing werkt eenvoudig: hoe harder het geluid, hoe hoger je vliegt. Houd er rekening mee dat dit tot nieuwsgierige blikken van omstanders kan leiden. Ik neem hiervoor geen verantwoordelijkheid. Aan het einde van het vak was ik trots op het resultaat, vooral omdat dit mijn eerste ervaring met JavaScript was. Ik heb echt ontzettend genoten van dit project, ook al heeft het me flink wat uren gekost!

### Cijfer: 10
