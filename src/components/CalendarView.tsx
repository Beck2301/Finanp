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
      date: inc.date.split('T')[0],
      backgroundColor: 'var(--status-done)',
      borderColor: 'var(--status-done)',
      textColor: 'white',
      extendedProps: { type: 'income', data: inc }
    }));

    const expenseEvents = expenses.map(exp => ({
      id: `exp-${exp.id}`,
      title: `- $${exp.amount} ${exp.concept}`,
      date: exp.date.split('T')[0],
      backgroundColor: exp.status === 'Completado' ? '#9ca3af' : 'var(--status-stuck)',
      borderColor: exp.status === 'Completado' ? '#9ca3af' : 'var(--status-stuck)',
      textColor: 'white',
      extendedProps: { type: 'expense', data: exp }
    }));

    return [...incomeEvents, ...expenseEvents];
  }, [incomes, expenses]);

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm w-full overflow-x-auto">
      <div className="min-w-[800px] calendar-container">
        <style dangerouslySetInnerHTML={{__html: `
          .calendar-container .fc {
            font-family: inherit;
            --fc-border-color: #f3f4f6;
            --fc-daygrid-event-dot-width: 5px;
          }
          .calendar-container .fc-toolbar-title {
            font-size: 1.1rem !important;
            font-weight: 700 !important;
            color: #1f2937;
            text-transform: capitalize;
          }
          .calendar-container .fc-button {
            background: white !important;
            border: 1px solid #e5e7eb !important;
            color: #4b5563 !important;
            font-size: 0.8rem !important;
            font-weight: 600 !important;
            padding: 0.4rem 0.8rem !important;
            box-shadow: 0 1px 2px rgba(0,0,0,0.05) !important;
            transition: all 0.2s !important;
          }
          .calendar-container .fc-button:hover {
            background: #f9fafb !important;
            border-color: #d1d5db !important;
          }
          .calendar-container .fc-button-active {
            background: #1f2937 !important;
            color: white !important;
            border-color: #1f2937 !important;
          }
          .calendar-container .fc-col-header-cell {
            padding: 12px 0 !important;
            background: #f9fafb;
            font-size: 0.75rem;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            color: #9ca3af;
            border: none !important;
          }
          .calendar-container .fc-daygrid-day {
            border-color: #f3f4f6 !important;
          }
          .calendar-container .fc-day-today {
            background: #fefce8 !important;
          }
          .calendar-container .fc-event {
            border: none !important;
            padding: 2px 6px !important;
            margin-top: 2px !important;
            box-shadow: 0 1px 2px rgba(0,0,0,0.05) !important;
          }
          .calendar-container .fc-daygrid-day-number {
            padding: 8px !important;
            font-size: 0.85rem;
            font-weight: 600;
            color: #6b7280;
          }
          .calendar-container .fc-daygrid-day-frame {
            min-height: 100px !important;
          }
        `}} />
        <FullCalendar
          plugins={[ dayGridPlugin, interactionPlugin, timeGridPlugin ]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek'
          }}
          events={events}
          height="auto"
          locale="es"
          buttonText={{
            today: 'Hoy',
            month: 'Mes',
            week: 'Semana',
            day: 'Día'
          }}
          eventClick={(info) => {
            console.log(info.event.extendedProps);
          }}
        />
      </div>
    </div>
  );
}
