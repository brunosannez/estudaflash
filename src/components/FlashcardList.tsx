
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Trash, BookPlus, PlusCircle } from "lucide-react";
import { useFlashcards } from "@/hooks/useFlashcards";

interface FlashcardListProps {
  resumoId: string;
  open: boolean;
  onClose: () => void;
}

const FlashcardList = ({ resumoId, open, onClose }: FlashcardListProps) => {
  const { cards, fetchFlashcards, createFlashcard, deleteFlashcard, loading } = useFlashcards(resumoId);
  const [showForm, setShowForm] = useState(false);
  const [pergunta, setPergunta] = useState("");
  const [resposta, setResposta] = useState("");
  const [exemplo, setExemplo] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) fetchFlashcards();
    // eslint-disable-next-line
  }, [open, resumoId]);

  const handleAdd = async () => {
    setSubmitting(true);
    await createFlashcard(pergunta, resposta, exemplo);
    setPergunta("");
    setResposta("");
    setExemplo("");
    setSubmitting(false);
    setShowForm(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-lg rounded-lg shadow-2xl relative p-6 max-h-[90vh] overflow-auto">
        <button onClick={onClose} className="absolute right-4 top-4 text-gray-500 hover:text-blue-600 text-xl" aria-label="Fechar">×</button>

        <CardHeader>
          <div className="flex items-center gap-2">
            <BookPlus className="h-5 w-5 text-purple-600" />
            <h2 className="font-bold text-xl">Flashcards</h2>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-2 flex justify-between items-center">
            <span className="text-sm text-gray-600">{cards.length} flashcard(s) cadastrados</span>
            <Button variant="outline" size="sm" onClick={() => setShowForm((v) => !v)}>
              <PlusCircle className="h-4 w-4 mr-1" /> Novo flashcard
            </Button>
          </div>
          {showForm && (
            <div className="border rounded p-3 mb-4 bg-gray-50">
              <Textarea
                value={pergunta}
                onChange={(e) => setPergunta(e.target.value)}
                placeholder="Digite a pergunta..."
                className="mb-2"
              />
              <Textarea
                value={resposta}
                onChange={(e) => setResposta(e.target.value)}
                placeholder="Digite a resposta..."
                className="mb-2"
              />
              <Textarea
                value={exemplo}
                onChange={(e) => setExemplo(e.target.value)}
                placeholder="Exemplo (opcional)"
                className="mb-2"
              />
              <div className="flex gap-2">
                <Button onClick={handleAdd} disabled={submitting || !pergunta || !resposta} size="sm">
                  {submitting ? <Loader2 className="animate-spin h-4 w-4 mr-1" /> : "Adicionar"}
                </Button>
                <Button variant="ghost" onClick={() => setShowForm(false)} size="sm">Cancelar</Button>
              </div>
            </div>
          )}

          {loading ? (
            <div className="flex justify-center my-6">
              <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
            </div>
          ) : cards.length === 0 ? (
            <div className="text-gray-500 text-center py-8 text-sm">Nenhum flashcard criado ainda.</div>
          ) : (
            <ul className="space-y-4">
              {cards.map((f) => (
                <li key={f.id} className="border rounded-lg p-3 bg-blue-50/80 relative">
                  <button onClick={() => deleteFlashcard(f.id)} className="absolute top-3 right-3 text-red-400 hover:text-red-600" aria-label="Remover">
                    <Trash className="w-4 h-4" />
                  </button>
                  <div>
                    <b>Pergunta:</b>
                    <div className="whitespace-pre-wrap break-words text-gray-800 mb-2">{f.pergunta}</div>
                    <b>Resposta:</b>
                    <div className="whitespace-pre-wrap break-words text-green-800 mb-1">{f.resposta}</div>
                    {f.exemplo && (
                      <>
                        <b>Exemplo:</b>
                        <div className="whitespace-pre-wrap break-words text-blue-800">{f.exemplo}</div>
                      </>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </div>
    </div>
  );
};

export default FlashcardList;
