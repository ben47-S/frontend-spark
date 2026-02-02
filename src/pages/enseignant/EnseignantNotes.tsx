import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { FileText, Plus, Edit, Save, Search } from 'lucide-react';

// Données simulées
const mockMatieres = [
  { id: '1', nom: 'Mathématiques', coefficient: 4 },
  { id: '2', nom: 'Physique', coefficient: 3 },
];

const mockEtudiantsNotes = [
  { id: '1', etudiant: { id: 'e1', nom: 'Dupont', prenom: 'Marie' }, note: 15.5, commentaire: 'Bon travail' },
  { id: '2', etudiant: { id: 'e2', nom: 'Martin', prenom: 'Jean' }, note: 12, commentaire: '' },
  { id: '3', etudiant: { id: 'e3', nom: 'Bernard', prenom: 'Sophie' }, note: null, commentaire: '' },
  { id: '4', etudiant: { id: 'e4', nom: 'Petit', prenom: 'Lucas' }, note: 18, commentaire: 'Excellent' },
  { id: '5', etudiant: { id: 'e5', nom: 'Robert', prenom: 'Emma' }, note: 9.5, commentaire: 'Peut mieux faire' },
];

export default function EnseignantNotes() {
  const [selectedMatiere, setSelectedMatiere] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [noteValue, setNoteValue] = useState('');
  const [commentaire, setCommentaire] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newNoteData, setNewNoteData] = useState({ etudiantId: '', note: '', commentaire: '' });

  const filteredEtudiants = mockEtudiantsNotes.filter(item =>
    item.etudiant.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.etudiant.prenom.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEditNote = (id: string, currentNote: number | null, currentCommentaire: string) => {
    setEditingNote(id);
    setNoteValue(currentNote?.toString() || '');
    setCommentaire(currentCommentaire);
  };

  const handleSaveNote = (id: string) => {
    // Simulation de sauvegarde - à remplacer par appel API
    console.log('Sauvegarde note:', { id, note: noteValue, commentaire });
    toast.success('Note enregistrée avec succès');
    setEditingNote(null);
    setNoteValue('');
    setCommentaire('');
  };

  const handleAddNote = () => {
    // Simulation d'ajout - à remplacer par appel API
    console.log('Ajout note:', newNoteData);
    toast.success('Note ajoutée avec succès');
    setIsAddDialogOpen(false);
    setNewNoteData({ etudiantId: '', note: '', commentaire: '' });
  };

  const getNoteColor = (note: number | null) => {
    if (note === null) return 'bg-muted text-muted-foreground';
    if (note >= 16) return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
    if (note >= 12) return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
    if (note >= 10) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
    return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Gestion des notes</h1>
            <p className="text-muted-foreground">
              Saisissez et modifiez les notes de vos étudiants
            </p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Ajouter une note
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Ajouter une note</DialogTitle>
                <DialogDescription>
                  Saisissez une nouvelle note pour un étudiant
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Étudiant</Label>
                  <Select
                    value={newNoteData.etudiantId}
                    onValueChange={(v) => setNewNoteData({ ...newNoteData, etudiantId: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un étudiant" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockEtudiantsNotes.map(item => (
                        <SelectItem key={item.etudiant.id} value={item.etudiant.id}>
                          {item.etudiant.prenom} {item.etudiant.nom}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Note (sur 20)</Label>
                  <Input
                    type="number"
                    min="0"
                    max="20"
                    step="0.5"
                    value={newNoteData.note}
                    onChange={(e) => setNewNoteData({ ...newNoteData, note: e.target.value })}
                    placeholder="Ex: 15.5"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Commentaire (optionnel)</Label>
                  <Textarea
                    value={newNoteData.commentaire}
                    onChange={(e) => setNewNoteData({ ...newNoteData, commentaire: e.target.value })}
                    placeholder="Remarques sur le travail de l'étudiant..."
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Annuler
                </Button>
                <Button onClick={handleAddNote}>
                  Enregistrer
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filtres */}
        <div className="flex flex-col gap-4 sm:flex-row">
          <Select value={selectedMatiere} onValueChange={setSelectedMatiere}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Sélectionner une matière" />
            </SelectTrigger>
            <SelectContent>
              {mockMatieres.map(m => (
                <SelectItem key={m.id} value={m.id}>
                  {m.nom} (coef. {m.coefficient})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Rechercher un étudiant..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Tableau des notes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Notes des étudiants
            </CardTitle>
            <CardDescription>
              {selectedMatiere 
                ? `Notes pour ${mockMatieres.find(m => m.id === selectedMatiere)?.nom}`
                : 'Sélectionnez une matière pour voir les notes'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!selectedMatiere ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <FileText className="h-12 w-12 opacity-50" />
                <p className="mt-4">Veuillez sélectionner une matière</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Étudiant</TableHead>
                    <TableHead className="text-center">Note</TableHead>
                    <TableHead>Commentaire</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEtudiants.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">
                        {item.etudiant.prenom} {item.etudiant.nom}
                      </TableCell>
                      <TableCell className="text-center">
                        {editingNote === item.id ? (
                          <Input
                            type="number"
                            min="0"
                            max="20"
                            step="0.5"
                            value={noteValue}
                            onChange={(e) => setNoteValue(e.target.value)}
                            className="w-20 mx-auto"
                          />
                        ) : (
                          <Badge className={getNoteColor(item.note)}>
                            {item.note !== null ? `${item.note}/20` : 'Non noté'}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {editingNote === item.id ? (
                          <Input
                            value={commentaire}
                            onChange={(e) => setCommentaire(e.target.value)}
                            placeholder="Commentaire..."
                          />
                        ) : (
                          <span className="text-muted-foreground">
                            {item.commentaire || '—'}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {editingNote === item.id ? (
                          <Button size="sm" onClick={() => handleSaveNote(item.id)}>
                            <Save className="mr-1 h-3 w-3" />
                            Enregistrer
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditNote(item.id, item.note, item.commentaire)}
                          >
                            <Edit className="mr-1 h-3 w-3" />
                            Modifier
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
