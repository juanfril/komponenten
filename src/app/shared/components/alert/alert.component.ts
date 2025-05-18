import { Component, computed, input, model, output } from '@angular/core';

export type AlertType = 'success' | 'error' | 'warning' | 'info';

@Component({
  selector: 'app-alert',
  imports: [],
  templateUrl: './alert.component.html',
  styleUrls: ['./alert.component.css'],
})
export class AlertComponent {
  type = input<AlertType>('error');
  message = model<string | null>(null);
  dismissible = input<boolean>(true);
  dismissed = output<void>();

  // Usando object literals en lugar de switch
  private typeClassMap = {
    success: 'text-green-800 bg-green-100 dark:bg-green-800 dark:text-green-100',
    error: 'text-red-800 bg-red-100 dark:bg-red-800 dark:text-red-100',
    warning: 'text-yellow-800 bg-yellow-100 dark:bg-yellow-800 dark:text-yellow-100',
    info: 'text-blue-800 bg-blue-100 dark:bg-blue-800 dark:text-blue-100',
    default: 'text-gray-800 bg-gray-100 dark:bg-gray-800 dark:text-gray-100',
  };

  // Object literal para los paths de SVG
  private iconPathMap = {
    error:
      'M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z',
    success:
      'M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z',
    warning:
      'M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z',
    info: 'M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z',
    default:
      'M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z',
  };

  // Path para el icono de cierre
  readonly closeIconPath =
    'M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z';

  alertClasses = computed(() => {
    const baseClasses = 'p-4 mb-4 rounded-lg flex justify-between items-start';
    const currentType = this.type();
    // Usando object literals para lookup
    return `${baseClasses} ${this.typeClassMap[currentType] || this.typeClassMap['default']}`;
  });

  // Método para obtener el icono según el tipo
  getIconPath(): string {
    const currentType = this.type();
    return this.iconPathMap[currentType] || this.iconPathMap['default'];
  }

  handleDismiss(): void {
    this.message.set(null);
    this.dismissed.emit();
  }
}
