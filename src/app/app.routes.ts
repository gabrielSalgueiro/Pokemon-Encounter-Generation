import { Routes } from '@angular/router';
import { GeneratorComponent } from './generator/generator.component';

export const routes: Routes = [
    { path: 'generator-component', component: GeneratorComponent },
    { path: '', redirectTo: 'generator-component', pathMatch: 'full' }
];
