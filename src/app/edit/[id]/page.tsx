"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Category, Reminder } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Icons, IconName } from "@/components/icons";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

export default function EditReminderPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [title, setTitle] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [freqUnit, setFreqUnit] = useState("year");
  const [freqInterval, setFreqInterval] = useState(1);
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/categories").then(res => res.json()),
      fetch("/api/reminders").then(res => res.json())
    ]).then(([categoriesData, remindersData]) => {
      setCategories(categoriesData || []);
      
      const reminder = (remindersData || []).find((r: Reminder) => r.id === id);
      if (reminder) {
        setTitle(reminder.title);
        setCategoryId(reminder.categoryId);
        setStartDate(reminder.nextDate); // allow changing the next date
        setDescription(reminder.description || "");
        
        const f = reminder.frequency;
        if (f.unit === 'once') {
          setFreqUnit("once");
          setFreqInterval(1);
        } else {
          setFreqUnit(f.unit);
          setFreqInterval(f.interval);
        }
      } else {
        router.push("/");
      }
      setIsReady(true);
    });
  }, [id, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !categoryId || !startDate) return;
    setLoading(true);

    const reminderUpdate = {
      title,
      categoryId,
      nextDate: startDate,
      description,
      frequency: {
        unit: freqUnit,
        interval: freqInterval
      }
    };

    const res = await fetch(`/api/reminders/${id}`, {
      method: "PUT",
      body: JSON.stringify(reminderUpdate)
    });

    if (res.ok) {
      router.back();
    } else {
      setLoading(false);
    }
  };

  const confirmDelete = async () => {
    setLoading(true);
    const res = await fetch(`/api/reminders/${id}`, { method: "DELETE" });
    if (res.ok) {
      router.push("/");
    } else {
      setLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  if (!isReady) return null;

  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto space-y-6">
      <header className="flex items-center justify-between pt-4 md:pt-0">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full">
            <Icons.ChevronLeft className="w-6 h-6" />
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">Modifier le rappel</h1>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setShowDeleteConfirm(true)} className="text-red-500 hover:text-red-600 rounded-full">
          <Icons.Trash className="w-5 h-5" />
        </Button>
      </header>

      <Card>
        <CardContent className="p-4 md:p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Quoi ?</label>
              <Input 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                placeholder="Ex: Vidange voiture" 
                required 
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Catégorie</label>
              <div className="flex overflow-x-auto space-x-3 pb-4 no-scrollbar">
                {categories.map(cat => {
                  const Icon = Icons[cat.icon as IconName] || Icons.Grid;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategoryId(cat.id)}
                      className={`flex-shrink-0 flex flex-col items-center justify-center w-24 h-24 rounded-2xl border transition-all ${
                        categoryId === cat.id 
                          ? "bg-primary text-primary-foreground border-primary shadow-md scale-105" 
                          : "bg-card text-foreground border-border hover:bg-muted hover:border-primary/50"
                      }`}
                    >
                      <Icon className="w-8 h-8 mb-2" style={{ color: categoryId === cat.id ? 'currentColor' : cat.color }} />
                      <span className="text-xs font-medium text-center leading-tight px-1">{cat.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Prochaine date</label>
                <Input 
                  type="date" 
                  value={startDate} 
                  onChange={(e) => setStartDate(e.target.value)} 
                  onClick={(e) => {
                    try {
                      if ('showPicker' in HTMLInputElement.prototype) {
                        e.currentTarget.showPicker();
                      }
                    } catch (err) {}
                  }}
                  required 
                  className="cursor-pointer"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Répétition</label>
                <div className="flex gap-2">
                  <select 
                    className="flex h-10 w-full rounded-2xl border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    value={freqUnit === 'once' ? 'once' : 'repeat'}
                    onChange={(e) => {
                      if (e.target.value === 'once') setFreqUnit('once');
                      else setFreqUnit('year');
                    }}
                  >
                    <option value="once">Une seule fois</option>
                    <option value="repeat">Personnalisée...</option>
                  </select>
                </div>

                {freqUnit !== 'once' && (
                  <div className="flex items-center gap-2 mt-2 p-3 bg-muted/30 rounded-2xl border">
                    <span className="text-sm font-medium whitespace-nowrap">Tous les</span>
                    <Input 
                      type="number" 
                      min="1" 
                      value={freqInterval} 
                      onChange={(e) => setFreqInterval(parseInt(e.target.value) || 1)}
                      className="w-20 bg-background"
                    />
                    <select 
                      className="flex h-10 w-full rounded-2xl border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                      value={freqUnit}
                      onChange={(e) => setFreqUnit(e.target.value)}
                    >
                      <option value="day">Jour(s)</option>
                      <option value="week">Semaine(s)</option>
                      <option value="month">Mois</option>
                      <option value="year">Année(s)</option>
                    </select>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Notes (optionnel)</label>
              <Input 
                value={description} 
                onChange={(e) => setDescription(e.target.value)} 
                placeholder="Ex: Garage Dupont" 
              />
            </div>

            <Button type="submit" className="w-full h-12 text-base mt-6" disabled={loading}>
              {loading ? "Enregistrement..." : "Enregistrer les modifications"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <ConfirmDialog 
        isOpen={showDeleteConfirm}
        title="Supprimer ce rappel"
        description="Êtes-vous sûr de vouloir supprimer ce rappel ? Cette action est irréversible."
        onConfirm={confirmDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </div>
  );
}
