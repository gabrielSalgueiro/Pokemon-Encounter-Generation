import { RankingEnum } from '../enums/ranking.enum';
import attributesData from '../contents/attributes.json'
import socialAttributesData from '../contents/social-attributes.json'
import skillsData from '../contents/skills.json'

export class GeneratedPokemon {
    pokedexImage: string;
    gender: string;
    nature: string;
    ranking: string;
    rankingImage: string;
    moves: Move[];
    hp: number;
    atributes : Attributes;

    constructor() {
        this.pokedexImage = '';
        this.gender = '';
        this.nature = '';
        this.ranking = '';
        this.rankingImage = '';
        this.moves = [];
        this.hp = 0;
        this.atributes = new Attributes();
    }

    getAttribute(attribute: string): number {
        return this.atributes[attribute as keyof Attributes]
    }
    
    initializeAttributes(baseValues: number[], maxValues: number[]) {
        return this.fill(
            attributesData, 
            baseValues, 
            maxValues
        );
    }

    initializeSocialAttributes() {
        return this.fill(
            socialAttributesData, 
            new Array(5).fill(1), 
            new Array(5).fill(5)
        );
    }

    initializeSkills() {
        const maxValue = Math.min(RankingEnum[this.ranking as keyof typeof RankingEnum]+1, 5);

        return this.fill(
            skillsData, 
            new Array(12).fill(0), 
            new Array(12).fill(maxValue)
        );
    }
    
    fill(attributes: string[], baseValues: number[], maxValues: number[]) {
        const upgradableAttributes: string[] = [];
        const maximumAttributes: number[] = [];

        for(let i = 0; i < attributes.length; i++) {
            const attribute = attributes[i];
            this.atributes[attribute as keyof Attributes] = baseValues[i];
            if(this.atributes[attribute as keyof Attributes] < maxValues[i]){
                upgradableAttributes.push(attribute);
                maximumAttributes.push(maxValues[i]);
            }
        }

        return { upgradableAttributes, maximumAttributes }
    }

    increment(attribute: string) {
        this.atributes[attribute as keyof Attributes]++;
    }
}

class Attributes {
    Strength: number;
    Dexterity: number;
    Vitality: number;
    Special: number;
    Insight: number;
    tough: number;
    cool: number;
    beauty: number;
    cute: number;
    clever: number;
    brawl: number;
    channel: number;
    clash: number;
    evasion: number;
    alert: number;
    athletic: number;
    nature: number;
    stealth: number;
    allure: number;
    etiquette: number;
    intimidate: number;
    perform: number;

    constructor() {
        this.Strength = 0;
        this.Dexterity = 0;
        this.Vitality = 0;
        this.Special = 0;
        this.Insight = 0;
        this.tough = 0;
        this.cool = 0;
        this.beauty = 0;
        this.cute = 0;
        this.clever = 0;
        this.brawl = 0;
        this.channel = 0;
        this.clash = 0;
        this.evasion = 0;
        this.alert = 0;
        this.athletic = 0;
        this.nature = 0;
        this.stealth = 0;
        this.allure = 0;
        this.etiquette = 0;
        this.intimidate = 0;
        this.perform = 0;
    }
}

interface Move {
    Learned: string;
    Name: string;
}