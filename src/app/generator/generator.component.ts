/*
  TO DO:
    - gerar atributos do pokemon
      - personalidade / mood
    - chance de shyni
    - chance de overgrowing
*/
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms'

import pokemonData from '../contents/pokemons-by-biome.json';
import probabilitiesData from '../contents/probabilities-by-ranking.json';
import biomesData from '../contents/biomes.json'
import rankingsData from '../contents/rankings.json'
import attributesData from '../contents/attributes.json'
import socialAttributesData from '../contents/social-attributes.json'
import skillsData from '../contents/skills.json'
import naturesData from '../contents/natures.json'
import { PokemonByBiomeInterface } from '../interfaces/pokemon-by-biome-interface.interface';
import { GeneratedPokemon } from '../models/genereted-pokmeon.model';
import { RankingEnum } from '../enums/ranking.enum';
import { RarityEnum } from '../enums/rarity.enum';

@Component({
  selector: 'app-generator',
  templateUrl: './generator.component.html',
  styleUrl: './generator.component.scss',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule]
})
export class GeneratorComponent {
  biomes = biomesData;
  rankings = rankingsData;
  pokemons: PokemonByBiomeInterface[] = pokemonData;
  rarityChances = probabilitiesData;
  attributes = attributesData;
  socialAttributes = socialAttributesData;
  skills = skillsData;
  natures = naturesData;
  differentBiomeChance: number = 0.001;
  attributesByRanking: number[] = [0, 2, 4, 6, 8, 8, 14];
  socialAttributesByRanking: number[] = [0, 2, 4, 6, 8, 14, 14];
  skillsByRanking: number[] = [5, 9, 12, 14, 15, 15, 16];

  selectedBiome = '';
  selectedRanking: keyof typeof this.rarityChances | '' = '';
  selectedPokemon: string = ''
  showPokedex: boolean = false;
  isShiny: boolean = false;
  shinyImage: string = 'assets/Images/shiny.png'
  isOvergrown: boolean = false;
  overgrownImage: string = 'assets/Images/giant.png'

  encounterResult: string | null = null;
  pokemonInfos: any = null;
  generatedPokemon: GeneratedPokemon = new GeneratedPokemon();
  maxAttributes: number[] = [];


  error: string = '';

  generateEncounter() {
    this.isShiny = this.masudaMethod();
    this.isOvergrown = this.masudaMethod();

    if(this.selectedPokemon) {
      this.loadPokemon(this.selectedPokemon);
      return
    }

    if (!this.selectedBiome || !this.selectedRanking) {
      this.encounterResult = 'Please, select a biome and a ranking!';
      return;
    }
    
    const filteredPokemons = this.chooseBiome();
    if (filteredPokemons.length === 0) {
      this.encounterResult = 'Nenhum Pokémon encontrado para este bioma!';
      return;
    }

    const encounterPokemon = this.sortByRanking(filteredPokemons);
    if(encounterPokemon == null) {
      this.encounterResult = 'Nenhum Pokémon encontrado para este bioma!';
      return;
    }

    this.encounterResult = `Você encontrou um ${encounterPokemon.name}!`;
    this.loadPokemon(encounterPokemon.name);
  }

  masudaMethod() {
    return Math.floor(Math.random() * 683) === 0;
  }

  // Biomes filter
  chooseBiome(): PokemonByBiomeInterface[] {
    const randomValue = Math.random();
    if(randomValue <= this.differentBiomeChance) {
      const randomBiome = this.filterByBiome(this.biomes[Math.floor(Math.random() * this.biomes.length)]);
      if(randomBiome.length != 0)
        return randomBiome;
    }

    return this.filterByBiome(this.selectedBiome);
  }

  filterByBiome(biome: string): PokemonByBiomeInterface[] {
    return this.pokemons.filter(
      (p) => p.habitat1 === biome || p.habitat2 === biome
    );
  }

  //Rarity filter
  sortByRanking(biomePokemons: PokemonByBiomeInterface[]): PokemonByBiomeInterface | null {
    if(this.selectedRanking === '')
        return null
  
    const chances = this.rarityChances[this.selectedRanking];
    const randomValue = Math.random();
    let rarity = 0;
    let cumulativeProbability = 0;
    for (let i = 0; i < chances.length; i++) {
      cumulativeProbability += chances[i];
      if (randomValue <= cumulativeProbability) {
        rarity = i;
        break;
      }
    }

    let encounter = this.sortByRarity(biomePokemons, rarity);
    if(encounter == null){
      encounter = this.sortLessRare(biomePokemons, --rarity);
      if(encounter == null)
        encounter = this.sortRarest(biomePokemons, ++rarity);
    }

    return encounter;
  }

  sortByRarity(biomePokemons: PokemonByBiomeInterface[], chosenRarity: number): PokemonByBiomeInterface | null {
    const encounterOptions = biomePokemons.filter(
      (p) => p.rarity === RarityEnum[chosenRarity]
    );

    if (encounterOptions.length > 0) {
      return encounterOptions[Math.floor(Math.random() * encounterOptions.length)];
    }

    return null;
  }

  sortLessRare(biomePokemons: PokemonByBiomeInterface[], chosenRarity: number): PokemonByBiomeInterface | null{
    while(chosenRarity >= 0) {
      const encounterOptions = this.sortByRarity(biomePokemons, chosenRarity--);

      if(encounterOptions != null)
        return encounterOptions;
    }

    return null;
  }

  sortRarest(biomePokemons: PokemonByBiomeInterface[], chosenRarity: number): PokemonByBiomeInterface | null{
    while(chosenRarity <= RarityEnum.Legendary) {
      const encounterOptions = this.sortByRarity(biomePokemons, chosenRarity++);

      if(encounterOptions != null)
        return encounterOptions;
    }

    return null;
  }

  //Load Pokemon infos from PokeRole
  async loadPokemon(name: string): Promise<void> {
    try {
      const data = await import(`../../assets/Pokerole-Data/Version20/Pokedex/${name}.json`);
      this.pokemonInfos = data;
      this.generatedPokemon.pokedexImage = `assets/Pokerole-Data/images/BookSprites/${this.pokemonInfos.Image}`;
      this.randomizeOtherFeatures();
      this.showPokedex = true;
      this.error = '';
    } catch {
      this.pokemonInfos = null;
      this.error = 'Pokémon não encontrado!';
    }
  }

  //Randomizes the other features
  randomizeOtherFeatures() {
    this.pokemonInfos.GenderType != "" ? this.generatedPokemon.gender = this.pokemonInfos.GenderType : this.generatedPokemon.gender = Math.random() < 0.5 ? "F" : "M";
    this.getRanking();
    this.generateAttributes();
    this.generateMoves();
  }

  getRanking() {
    const randomValue = Math.random();
    if(randomValue < 0.09) {
      const rank : number = RankingEnum[this.pokemonInfos.RecommendedRank as keyof typeof RankingEnum] - 2;
      rank < 0 ? this.generatedPokemon.ranking = "Starter" : this.generatedPokemon.ranking = RankingEnum[rank];
    }
    else if(randomValue < 0.39) {
      const rank : number = RankingEnum[this.pokemonInfos.RecommendedRank as keyof typeof RankingEnum] - 1;
      rank < 0 ? this.generatedPokemon.ranking = "Starter" : this.generatedPokemon.ranking = RankingEnum[rank];
    }
    else if(randomValue < 0.89) {
      this.generatedPokemon.ranking = this.pokemonInfos.RecommendedRank;
    }
    else if(randomValue < 0.99) {
      const rank : number = RankingEnum[this.pokemonInfos.RecommendedRank as keyof typeof RankingEnum] + 1;
      rank > 6 ? this.generatedPokemon.ranking = "Champion" : this.generatedPokemon.ranking = RankingEnum[rank];
    }
    else {
      const rank : number = RankingEnum[this.pokemonInfos.RecommendedRank as keyof typeof RankingEnum] + 2;
      rank > 6 ? this.generatedPokemon.ranking = "Champion" : this.generatedPokemon.ranking = RankingEnum[rank];
    }

    this.generatedPokemon.rankingImage = `assets/Rankings/${this.generatedPokemon.ranking}.png`;
  }

  generateAttributes() {
    this.randomizeNature();

    this.getMaxAttributes();
    let { upgradableAttributes, maximumAttributes} = this.generatedPokemon.initializeAttributes(
      [this.pokemonInfos.Strength, this.pokemonInfos.Dexterity, this.pokemonInfos.Vitality, this.pokemonInfos.Special, this.pokemonInfos.Insight],
      this.maxAttributes
    );
    this.randomizeAttributes(upgradableAttributes, maximumAttributes, this.attributesByRanking[RankingEnum[this.generatedPokemon.ranking as keyof typeof RankingEnum]]);
    
    // this.generatedPokemon.hp = this.pokemonInfos.BaseHP + this.generatedPokemon.getAttribute('Vitality');
    
    ({ upgradableAttributes, maximumAttributes} = this.generatedPokemon.initializeSocialAttributes());
    this.randomizeAttributes(upgradableAttributes, maximumAttributes, this.socialAttributesByRanking[RankingEnum[this.generatedPokemon.ranking as keyof typeof RankingEnum]]);
    
    ({ upgradableAttributes, maximumAttributes} = this.generatedPokemon.initializeSkills());
    this.randomizeAttributes(upgradableAttributes, maximumAttributes, this.skillsByRanking[RankingEnum[this.generatedPokemon.ranking as keyof typeof RankingEnum]]);
  }

  randomizeNature() {
    this.generatedPokemon.nature = this.natures[Math.floor(Math.random()*this.natures.length)];
  }

  getMaxAttributes() {
    this.maxAttributes = [];
    this.attributes.forEach(att => {
      this.maxAttributes.push(this.pokemonInfos[`Max${att}`]);
    });
  }

  randomizeAttributes(upgradableAttributes: string[], maximumAttributes: number[], points: number) {
    while(points > 0 && upgradableAttributes.length > 0) {
      const randomAttribute = Math.floor(Math.random() * upgradableAttributes.length);
      const attribute = upgradableAttributes[randomAttribute];
      this.generatedPokemon.increment(attribute);
      if(this.generatedPokemon.getAttribute(attribute) == maximumAttributes[randomAttribute]){
        upgradableAttributes.splice(randomAttribute, 1);
        maximumAttributes.splice(randomAttribute, 1);
      }
      points--;
    }
  }

  generateMoves() {
    this.generatedPokemon.moves = [];
    const possibleMoves = this.pokemonInfos.Moves.filter((m: any) => {
      const numberValue = RankingEnum[m.Learned as keyof typeof RankingEnum]
      return numberValue <= RankingEnum[this.generatedPokemon.ranking as keyof typeof RankingEnum]
    });
    
    // const ammountMoves = Math.ceil(Math.random() * (this.generatedPokemon.atributes.Insight + 2));
    const ammountMoves = this.generatedPokemon.atributes.Insight + 2;
    
    
    while(possibleMoves.length > 0 && this.generatedPokemon.moves.length < ammountMoves) {
      const randomSelect = Math.floor(Math.random() * possibleMoves.length);
      this.generatedPokemon.moves.push(possibleMoves[randomSelect]);
      possibleMoves.splice(randomSelect, 1);
    }
  }

  getMoveImage(move: string): string {
    return `assets/Pokerole-Data/Version20/Move Cards/${move}.png`;
  }

  getTypeClass(type: string) {
    return type.charAt(0).toUpperCase() + type.slice(1);
  }

  getBalls(attributeValue: number, maxAttribute: number) {
    return Array(attributeValue).fill(true).concat(Array(maxAttribute - attributeValue).fill(false));
  }

  resetForm() {
    this.showPokedex = false;
    this.selectedPokemon = '';
  }

  capitalizeFirstLetter(str: string): string {
    if (!str) return str;
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }
}
