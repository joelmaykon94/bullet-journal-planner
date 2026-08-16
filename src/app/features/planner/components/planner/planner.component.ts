import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DailyLogComponent } from '../../../daily-log/components/daily-log/daily-log.component';
import { WeeklyLogComponent } from '../../../weekly-log/components/weekly-log/weekly-log.component';
import { MonthlyLogComponent } from '../../../monthly-log/components/monthly-log/monthly-log.component';

type PlannerTab = 'dia' | 'semana' | 'mes';

@Component({
  selector: 'app-planner',
  standalone: true,
  imports: [
    CommonModule, 
    DailyLogComponent, 
    WeeklyLogComponent,
    MonthlyLogComponent
  ],
  template: `
    <!-- Layout Unificado: Uma única coluna principal de conteúdo -->
    <!-- Coluna 1 já é a barra lateral de navegação no app.component.html -->
    <div class="h-full flex flex-col gap-6 p-4 lg:p-6 max-w-[1600px] mx-auto animate-fade-in overflow-hidden">
      
      <!-- Header / Tabs do Fluxo Principal -->
      <div class="flex items-center justify-start gap-2 p-1 border-b border-stone-200 shrink-0">
        <button (click)="activeTab = 'dia'" 
                class="px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all"
                [ngClass]="activeTab === 'dia' ? 'bg-stone-800 text-stone-100 shadow-md' : 'text-stone-500 hover:bg-stone-100'">
          Dia
        </button>
        <button (click)="activeTab = 'semana'" 
                class="px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all"
                [ngClass]="activeTab === 'semana' ? 'bg-stone-800 text-stone-100 shadow-md' : 'text-stone-500 hover:bg-stone-100'">
          Semana
        </button>
        <button (click)="activeTab = 'mes'" 
                class="px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all"
                [ngClass]="activeTab === 'mes' ? 'bg-stone-800 text-stone-100 shadow-md' : 'text-stone-500 hover:bg-stone-100'">
          Mês
        </button>
      </div>

      <!-- Container Único de Conteúdo -->
      <div class="flex-1 bg-[#f9f8f6] rounded-xl shadow-[inset_0_2px_10px_rgba(0,0,0,0.02)] border border-stone-200 overflow-hidden relative min-h-[600px] flex flex-col">
        <div class="flex-1 overflow-y-auto content-scroll">
          
          <!-- VISÃO DIA -->
          <div *ngIf="activeTab === 'dia'" class="h-full p-4 sm:p-6 w-full">
            <app-daily-log class="block w-full h-full"></app-daily-log>
          </div>
          
          <!-- VISÃO SEMANA -->
          <div *ngIf="activeTab === 'semana'" class="p-4 sm:p-6 h-full planner-daily-wrapper w-full">
            <app-weekly-log class="block w-full h-full"></app-weekly-log>
          </div>
          
          <!-- VISÃO MÊS -->
          <div *ngIf="activeTab === 'mes'" class="p-4 sm:p-6 h-full planner-daily-wrapper w-full">
            <app-monthly-log class="block w-full h-full"></app-monthly-log>
          </div>

        </div>
      </div>

    </div>
  `,
  styles: [`
    /* Ajuste fino: o DailyLog tem margens negativas no topo, vamos resetar aqui */
    .planner-daily-wrapper {
      padding-top: 1rem;
    }
    .planner-daily-wrapper app-daily-log {
      display: block;
      height: 100%;
      margin-top: 0 !important; 
    }
    .planner-daily-wrapper .page-turning-wrapper {
      margin-top: 0;
    }
  `],
  encapsulation: ViewEncapsulation.None
})
export class PlannerComponent implements OnInit {
  activeTab: PlannerTab = 'dia';

  ngOnInit() {}
}
