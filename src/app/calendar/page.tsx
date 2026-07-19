"use client";

import { useState, useEffect } from "react";
import { Reminder, Category } from "@/types";
import { Icons, IconName } from "@/components/icons";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  parseISO 
} from "date-fns";
import { fr } from "date-fns/locale";
import Link from "next/link";

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  useEffect(() => {
    Promise.all([
      fetch("/api/reminders").then(res => res.json()),
      fetch("/api/categories").then(res => res.json())
    ]).then(([remindersData, categoriesData]) => {
      setReminders(remindersData || []);
      setCategories(categoriesData || []);
    });
  }, []);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });
  
  const days = eachDayOfInterval({ start: startDate, end: endDate });

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  const selectedDateReminders = reminders.filter(r => isSameDay(parseISO(r.nextDate), selectedDate));

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6">
      <header className="flex justify-between items-center pt-4 md:pt-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Calendrier</h1>
          <p className="text-muted-foreground mt-1">Gérez vos échéances au fil des mois.</p>
        </div>
      </header>

      <Card>
        <CardContent className="p-4 md:p-6">
          {/* Calendar Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold capitalize">{format(currentDate, "MMMM yyyy", { locale: fr })}</h2>
            <div className="flex space-x-2">
              <Button variant="outline" size="icon" onClick={prevMonth} className="rounded-full">
                <Icons.ChevronLeft className="w-5 h-5" />
              </Button>
              <Button variant="outline" size="icon" onClick={nextMonth} className="rounded-full">
                <Icons.ChevronRight className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1 md:gap-2 mb-2 text-center text-sm font-medium text-muted-foreground">
            {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map(day => (
              <div key={day} className="py-2">{day}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1 md:gap-2">
            {days.map(day => {
              const dayReminders = reminders.filter(r => isSameDay(parseISO(r.nextDate), day));
              const isSelected = isSameDay(day, selectedDate);
              const isCurrentMonth = isSameMonth(day, currentDate);
              const isToday = isSameDay(day, new Date());

              return (
                <div 
                  key={day.toISOString()} 
                  onClick={() => setSelectedDate(day)}
                  className={`
                    min-h-[60px] md:min-h-[80px] p-1 md:p-2 border rounded-2xl cursor-pointer transition-colors
                    ${!isCurrentMonth ? "bg-muted/30 text-muted-foreground border-transparent" : "bg-card border-border hover:border-primary/50"}
                    ${isSelected ? "ring-2 ring-primary border-transparent" : ""}
                    ${isToday ? "bg-primary/5" : ""}
                  `}
                >
                  <div className={`text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full ${isToday ? "bg-primary text-white" : ""}`}>
                    {format(day, "d")}
                  </div>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {dayReminders.slice(0, 3).map(r => {
                      const cat = categories.find(c => c.id === r.categoryId);
                      return (
                        <div key={r.id} className="w-2 h-2 rounded-full" style={{ backgroundColor: cat?.color || '#0ea5e9' }} />
                      );
                    })}
                    {dayReminders.length > 3 && (
                      <div className="text-[10px] font-medium text-muted-foreground">+{dayReminders.length - 3}</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Reminders for selected date */}
      <div>
        <h3 className="text-lg font-semibold mb-3">
          Échéances le {format(selectedDate, "d MMMM yyyy", { locale: fr })}
        </h3>
        {selectedDateReminders.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground bg-muted/50 rounded-3xl">
            Aucun rappel pour cette date.
          </div>
        ) : (
          <div className="grid gap-3">
            {selectedDateReminders.map(r => {
              const category = categories.find(c => c.id === r.categoryId);
              const Icon = category ? Icons[category.icon as IconName] || Icons.FileText : Icons.FileText;
              return (
                <Card key={r.id}>
                  <CardContent className="p-4 flex items-center gap-4">
                    <div 
                      className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm"
                      style={{ backgroundColor: category?.color ? `${category.color}15` : '#f1f5f9' }}
                    >
                      <Icon className="w-6 h-6" style={{ color: category?.color || '#64748b' }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-base truncate">{r.title}</h4>
                      <p className="text-sm text-muted-foreground truncate">{category?.name || "Sans catégorie"}</p>
                    </div>
                    <Link href={`/edit/${r.id}`} className="shrink-0">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="rounded-full text-muted-foreground hover:text-primary"
                      >
                        <Icons.Pencil className="w-4 h-4" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
