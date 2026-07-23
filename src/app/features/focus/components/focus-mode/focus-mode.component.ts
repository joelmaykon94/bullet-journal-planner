import { Component, OnInit, OnDestroy, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { BujoService, BujoItem } from '../../../../services/bujo.service';
import { ModalService } from '../../../../services/modal.service';

interface ProposalItem {
  id: string;
  content: string;
  originalDate: string;
  proposedDate: string;
  action: 'keep' | 'postpone' | 'future' | 'simplify';
}

@Component({
  selector: 'app-focus-mode',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './focus-mode.component.html',
  styleUrls: ['./focus-mode.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class FocusModeComponent implements OnInit, OnDestroy {
  anxiety: number = 3;
  energy: 'high' | 'low' | 'exhausted' = 'low';
  availableHours: number = 2;
  
  counsel: string = '';
  isGeneratingCounsel = false;
  proposal: ProposalItem[] = [];
  step: 'inputs' | 'proposal' = 'inputs';

  private items: BujoItem[] = [];
  private sub?: Subscription;

  constructor(private bujoService: BujoService, private modalService: ModalService) {}

  ngOnInit() {
    this.sub = this.bujoService.items$.subscribe(items => {
      this.items = items;
    });
  }

  ngOnDestroy() {
    if (this.sub) this.sub.unsubscribe();
  }

  get pendingTasks() {
    return this.items.filter(i => i.status === 'todo' && i.type === 'task');
  }

  generateReliefPlan() {
    this.isGeneratingCounsel = true;
    this.step = 'proposal';

    setTimeout(() => {
      this.generateFallbackCounsel();
      this.generateProposal();
      this.isGeneratingCounsel = false;
    }, 1000);
  }

  private generateFallbackCounsel() {
    if (this.anxiety >= 4 || this.energy === 'exhausted') {
      this.counsel = '⚠️ ALERTA DE ESGOTAMENTO: Seu cérebro está sinalizando sobrecarga severa. Não tente abraçar o mundo hoje. A prioridade absoluta é reduzir o estresse. Sugerimos focar em apenas uma tarefa simples ou tirar um período de descanso programado. Seus compromissos restantes foram remanejados para dar espaço para você respirar.';
    } else if (this.anxiety === 3 || this.energy === 'low') {
      this.counsel = '⚖️ RITMO MODERADO: Sua energia está reduzida e há sinais de tensão. O melhor caminho é o equilíbrio. Selecionamos apenas 1 ou 2 tarefas prioritárias para hoje, jogando as demandas burocráticas ou não essenciais para o decorrer da semana. Vá com calma, uma micro-etapa de cada vez.';
    } else {
      this.counsel = '⚡ RITMO SAUDÁVEL: Sua energia está boa e a ansiedade sob controle. Mesmo assim, para evitar frustração pós-almoço, distribuímos as tarefas de forma equilibrada ao longo do dia, agendando as mais pesadas para as próximas horas.';
    }
  }

  private generateProposal() {
    let maxTasksToday = 1;
    if (this.energy === 'high') {
      maxTasksToday = this.availableHours >= 4 ? 3 : 2;
    } else if (this.energy === 'low') {
      maxTasksToday = this.availableHours >= 4 ? 2 : 1;
    } else {
      maxTasksToday = 1;
    }

    const todayStr = new Date().toISOString().split('T')[0];
    
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    
    const nextMonday = new Date();
    const currentDay = nextMonday.getDay();
    const distanceToMonday = currentDay === 0 ? 1 : 8 - currentDay;
    nextMonday.setDate(nextMonday.getDate() + distanceToMonday);
    const nextMondayStr = nextMonday.toISOString().split('T')[0];

    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    nextMonth.setDate(1);
    const nextMonthStr = nextMonth.toISOString().split('T')[0];

    let allocatedToday = 0;
    this.proposal = this.pendingTasks.map((task, idx) => {
      let proposedDate = todayStr;
      let action: 'keep' | 'postpone' | 'future' | 'simplify' = 'keep';

      if (task.priority && allocatedToday < maxTasksToday) {
        proposedDate = todayStr;
        action = 'keep';
        allocatedToday++;
      } else if (allocatedToday < maxTasksToday && idx < maxTasksToday) {
        proposedDate = todayStr;
        action = 'keep';
        allocatedToday++;
      } else {
        if (idx % 3 === 0) {
          proposedDate = tomorrowStr;
          action = 'postpone';
        } else if (idx % 3 === 1) {
          proposedDate = nextMondayStr;
          action = 'postpone';
        } else {
          proposedDate = nextMonthStr;
          action = 'future';
        }
      }

      if (proposedDate === todayStr && (this.energy === 'exhausted' || this.anxiety >= 4)) {
        action = 'simplify';
      }

      return {
        id: task.id,
        content: task.content,
        originalDate: task.date,
        proposedDate,
        action
      };
    });
  }

  async applyProposal() {
    this.proposal.forEach(prop => {
      const item = this.items.find(i => i.id === prop.id);
      if (item) {
        // Just updating the date for simplicity in this migration
        this.bujoService.updateItem(prop.id, { date: prop.proposedDate });
      }
    });
    await this.modalService.alert('Planilha de Carga Cognitiva reorganizada com sucesso!', 'Sucesso');
    this.step = 'inputs';
  }
}
