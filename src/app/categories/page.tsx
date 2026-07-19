"use client";

import { useState, useEffect } from "react";
import { Category } from "@/types";
import { Icons, IconName } from "@/components/icons";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCatName, setNewCatName] = useState("");
  const [newCatColor, setNewCatColor] = useState("#0ea5e9");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchCategories = () => {
    fetch("/api/categories")
      .then(res => res.json())
      .then(data => setCategories(data || []));
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName) return;
    
    await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newCatName, color: newCatColor, icon: "Grid" })
    });
    setNewCatName("");
    fetchCategories();
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    await fetch(`/api/categories/${deleteId}`, { method: "DELETE" });
    setDeleteId(null);
    fetchCategories();
  };

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6">
      <header className="pt-4 md:pt-0">
        <h1 className="text-3xl font-bold tracking-tight">Catégories</h1>
        <p className="text-muted-foreground mt-1">Gérez les différentes catégories de vos échéances.</p>
      </header>

      <Card>
        <CardContent className="p-4 md:p-6">
          <form onSubmit={handleAdd} className="flex gap-3 items-end">
            <div className="flex-1 space-y-2">
              <label className="text-sm font-medium">Nouvelle catégorie</label>
              <Input 
                value={newCatName} 
                onChange={(e) => setNewCatName(e.target.value)} 
                placeholder="Ex: Entretien vélo" 
              />
            </div>
            <div className="space-y-2 w-16">
              <label className="text-sm font-medium text-transparent">Couleur</label>
              <Input 
                type="color" 
                value={newCatColor} 
                onChange={(e) => setNewCatColor(e.target.value)} 
                className="w-full h-10 p-1 cursor-pointer" 
              />
            </div>
            <Button type="submit">Ajouter</Button>
          </form>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {categories.map(cat => {
          const Icon = Icons[cat.icon as IconName] || Icons.Grid;
          return (
            <Card key={cat.id} className="group relative overflow-hidden transition-all hover:shadow-md hover:border-primary/50">
              <CardContent className="p-6 flex flex-col items-center justify-center text-center h-32">
                <div 
                  className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm mb-3"
                  style={{ backgroundColor: `${cat.color}15` }}
                >
                  <Icon className="w-6 h-6" style={{ color: cat.color }} />
                </div>
                <span className="font-medium text-sm line-clamp-1">{cat.name}</span>
                
                <Button 
                  type="button"
                  variant="ghost" 
                  size="icon" 
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-red-500 rounded-full w-8 h-8 bg-background/80 backdrop-blur-sm"
                  onClick={(e) => {
                    e.preventDefault();
                    setDeleteId(cat.id);
                  }}
                >
                  <Icons.Trash className="w-4 h-4" />
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <ConfirmDialog 
        isOpen={deleteId !== null}
        title="Supprimer la catégorie"
        description="Êtes-vous sûr de vouloir supprimer cette catégorie ? Cette action est irréversible."
        onConfirm={confirmDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
