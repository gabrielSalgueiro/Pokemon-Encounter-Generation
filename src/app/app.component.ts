import { Component } from '@angular/core';

import { GeneratorComponent } from './generator/generator.component';

@Component({
  selector: 'app-root',
  imports: [GeneratorComponent],
  templateUrl: './app.component.html',
  // styleUrl: './app.component.scss',
  standalone: true
})
export class AppComponent {
  title = 'pokemon-encounter-generation';
}
