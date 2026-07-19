"use client";

import { useState, useEffect } from "react";
import { Reminder, Category } from "@/types";
import { Icons, IconName } from "@/components/icons";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { isBefore, isToday, parseISO, differenceInDays } from "date-fns";
import Link from "next/link";

export default function Home() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    Promise.all([
      fetch("/api/reminders").then(res => res.json()),
      fetch("/api/categories").then(res => res.json())
    ]).then(([remindersData, categoriesData]) => {
      setReminders(remindersData || []);
      setCategories(categoriesData || []);
    });
  }, []);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const filteredReminders = reminders.filter(r => {
    const matchCat = activeCategory === "all" || r.categoryId === activeCategory;
    const catName = categories.find(c => c.id === r.categoryId)?.name || "";
    const matchSearch = r.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        (r.description || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
                        catName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  const sortedReminders = [...filteredReminders].sort((a, b) => 
    new Date(a.nextDate).getTime() - new Date(b.nextDate).getTime()
  );

  const overdue = sortedReminders.filter(r => isBefore(parseISO(r.nextDate), today));
  const dueToday = sortedReminders.filter(r => isToday(parseISO(r.nextDate)));
  const upcoming = sortedReminders.filter(r => !isBefore(parseISO(r.nextDate), today) && !isToday(parseISO(r.nextDate)));

  const handleComplete = async (id: string) => {
    const res = await fetch(`/api/reminders/${id}/complete`, { 
      method: "POST", 
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}) 
    });
    if (res.ok) {
      // Refresh
      const newReminders = await fetch("/api/reminders").then(r => r.json());
      setReminders(newReminders);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-8 relative min-h-screen">
      {/* Header */}
      <header className="flex justify-between items-center pt-4 md:pt-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Bonjour !</h1>
          <p className="text-muted-foreground mt-1">Voici vos échéances à venir.</p>
        </div>
      </header>

      {/* Search Bar */}
      <div className="relative">
        <Icons.Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input 
          type="text" 
          placeholder="Rechercher un rappel, une catégorie..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-4 py-3 rounded-2xl border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
        />
      </div>

      {/* Category Filter */}
      <div className="flex overflow-x-auto space-x-2 pb-2 no-scrollbar">
        <Button 
          variant={activeCategory === "all" ? "default" : "secondary"}
          onClick={() => setActiveCategory("all")}
          className="rounded-full"
        >
          Tous
        </Button>
        {categories.map(cat => {
          const Icon = Icons[cat.icon as IconName] || Icons.Grid;
          return (
            <Button
              key={cat.id}
              variant={activeCategory === cat.id ? "default" : "secondary"}
              onClick={() => setActiveCategory(cat.id)}
              className="rounded-full"
            >
              <Icon className="w-4 h-4 mr-2" style={{ color: activeCategory === cat.id ? '#fff' : cat.color }} />
              {cat.name}
            </Button>
          );
        })}
      </div>

      {/* Dashboard sections */}
      <div className="space-y-6">
        {overdue.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold text-red-500 flex items-center mb-3">
              <span className="w-2 h-2 rounded-full bg-red-500 mr-2 animate-pulse" />
              En retard
            </h2>
            <div className="grid gap-3">
              {overdue.map(r => <ReminderRow key={r.id} reminder={r} categories={categories} onComplete={handleComplete} isOverdue />)}
            </div>
          </section>
        )}

        {dueToday.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold flex items-center mb-3">
              Aujourd'hui
            </h2>
            <div className="grid gap-3">
              {dueToday.map(r => <ReminderRow key={r.id} reminder={r} categories={categories} onComplete={handleComplete} />)}
            </div>
          </section>
        )}

        <section>
          <h2 className="text-lg font-semibold flex items-center mb-3">
            À venir
          </h2>
          {upcoming.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground bg-muted/50 rounded-3xl">
              Aucune échéance à venir.
            </div>
          ) : (
            <div className="grid gap-3">
              {upcoming.map(r => <ReminderRow key={r.id} reminder={r} categories={categories} onComplete={handleComplete} />)}
            </div>
          )}
        </section>
      </div>

      {/* FAB */}
      <Link href="/add" className="fixed bottom-20 md:bottom-8 right-4 md:right-8 z-50">
        <Button 
          size="icon" 
          className="w-14 h-14 rounded-full shadow-lg"
        >
          <Icons.Plus className="w-6 h-6" />
        </Button>
      </Link>
    </div>
  );
}

function formatFrequency(f: any) {
  if (!f || f.unit === 'once') return "Une fois";
  const units: Record<string, string> = { day: 'jour', week: 'semaine', month: 'mois', year: 'an' };
  const unit = units[f.unit];
  if (f.interval === 1) return `Chaque ${unit}`;
  return `Tous les ${f.interval} ${unit}s`;
}

function ReminderRow({ reminder, categories, onComplete, isOverdue = false }: { reminder: Reminder, categories: Category[], onComplete: (id: string) => void, isOverdue?: boolean }) {
  const category = categories.find(c => c.id === reminder.categoryId);
  const Icon = category ? Icons[category.icon as IconName] || Icons.FileText : Icons.FileText;
  const days = differenceInDays(parseISO(reminder.nextDate), new Date());
  
  let daysText = "";
  let cardClass = "flex items-center gap-4 p-4 border rounded-2xl transition-all hover:shadow-md group ";
  let dateClass = "text-sm text-right ";

  if (days < 0) {
    daysText = `En retard de ${Math.abs(days)} jour(s)`;
    cardClass += "border-red-500/50 bg-red-500/5 hover:bg-red-500/10";
    dateClass += "text-red-500 font-semibold";
  } else if (days === 0) {
    daysText = "Aujourd'hui";
    cardClass += "border-amber-500/50 bg-amber-500/5 hover:bg-amber-500/10";
    dateClass += "text-amber-500 font-semibold";
  } else if (days <= 7) {
    daysText = `Dans ${days} jour(s)`;
    cardClass += "border-primary/30 bg-primary/5 hover:bg-primary/10";
    dateClass += "text-primary font-medium";
  } else {
    daysText = `Dans ${days} jour(s)`;
    cardClass += "bg-card border-border";
    dateClass += "text-muted-foreground";
  }

  return (
    <div className={cardClass}>
      <div 
        className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 shadow-sm"
        style={{ backgroundColor: `${category?.color || '#64748b'}15` }}
      >
        <Icon className="w-6 h-6" style={{ color: category?.color || '#64748b' }} />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-base truncate">{reminder.title}</h3>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-sm text-muted-foreground truncate max-w-[120px] sm:max-w-[150px]">
            {category?.name || "Sans catégorie"}
          </span>
          <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full whitespace-nowrap">
            {formatFrequency(reminder.frequency)}
          </span>
        </div>
        {reminder.description && (
          <p className="text-sm text-muted-foreground/70 mt-1 line-clamp-1 italic">
            {reminder.description}
          </p>
        )}
      </div>
      <div className="shrink-0 flex flex-col items-end gap-2">
        <div className="flex items-center gap-1.5">
          <Icons.Calendar className="w-4 h-4 text-muted-foreground" />
          <span className={dateClass}>{daysText}</span>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Edit button */}
          <Link href={`/edit/${reminder.id}`}>
            <Button 
              variant="ghost" 
              size="icon" 
              className="rounded-full w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-primary"
            >
              <Icons.Pencil className="w-4 h-4" />
            </Button>
          </Link>
          
          <Button 
            variant="outline" 
            size="sm" 
            className="rounded-xl hidden sm:flex hover:bg-green-50 dark:hover:bg-green-500/10 hover:text-green-600 hover:border-green-200 dark:hover:border-green-500/30"
            onClick={() => onComplete(reminder.id)}
          >
            <Icons.Check className="w-4 h-4 mr-2" />
            Fait
          </Button>
          {/* Mobile quick complete */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-full sm:hidden text-muted-foreground hover:text-green-600"
            onClick={() => onComplete(reminder.id)}
          >
            <Icons.Check className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
