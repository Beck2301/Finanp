import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import timeGridPlugin from '@fullcalendar/timegrid'
import { Income, Expense } from '@/types/finance'
import { useMemo } from 'react'

interface CalendarViewProps {
  incomes: Income[];
  expenses: Expense[];
}

export function CalendarView({ incomes, expenses }: CalendarViewProps) {
  
  const events = useMemo(() => {
    const incomeEvents = incomes.map(inc => ({
      id: `inc-${inc.id}`,
      title: `+ $${inc.amount} ${inc.source}`,
      date: inc.date,
      backgroundColor: 'var(--status-done)',
      borderColor: 'var(--status-done)',
      textColor: 'white',
      extendedProps: { type: 'income', data: inc }
    }));

    const expenseEvents = expenses.map(exp => ({
      id: `exp-${exp.id}`,
      title: `- $${exp.amount} ${exp.concept}`,
      date: exp.date,
      backgroundColor: exp.status === 'Completado' ? '#9ca3af' : 'var(--status-stuck)',
      borderColor: exp.status === 'Completado' ? '#9ca3af' : 'var(--status-stuck)',
      textColor: 'white',
      extendedProps: { type: 'expense', data: exp }
    }));

    return [...incomeEvents, ...expenseEvents];
  }, [incomes, expenses]);

  return (
    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm h-full min-h-[600px] w-full overflow-x-auto">
      <div className="min-w-[700px] h-full calendar-container">
        <style dangerouslySetInnerHTML={{__html: `
          .calendar-container .fc {
            font-family: var(--font-sans);
            color: var(--foreground);
          }
          .calendar-container .fc-toolbar-title {
            font-size: 1.25rem !important;
            font-weight: 700 !important;
          }
          .calendar-container .fc-button-primary {
            background-color: white !important;
            color: #374151 !important;
            border-color: #d1d5db !important;
            text-transform: capitalize;
          }
          .calendar-container .fc-button-active {
            background-color: var(--primary) !important;
            color: white !important;
            border-color: var(--primary) !important;
          }
          .calendar-container .fc-event {
            border-radius: 4px;
            padding: 2px 4px;
            font-size: 0.75rem;
            font-weight: 500;
            cursor: pointer;
            transition: opacity 0.2s;
          }
          .calendar-container .fc-event:hover {
            opacity: 0.8;
          }
          .calendar-container .fc-daygrid-day-number {
            color: #4b5563;
            font-weight: 500;
            font-size: 0.875rem;
          }
        `}} />
        <FullCalendar
          plugins={[ dayGridPlugin, interactionPlugin, timeGridPlugin ]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
          }}
          events={events}
          height="100%"
          locale="es"
          buttonText={{
            today: 'Hoy',
            month: 'Mes',
            week: 'Semana',
            day: 'Día'
          }}
          eventClick={(info) => {
            // Future enhancement: Open details modal
            console.log(info.event.extendedProps);
          }}
        />
      </div>
    </div>
  );
}
