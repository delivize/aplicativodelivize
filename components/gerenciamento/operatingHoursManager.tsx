"use client";

import { useState, useEffect } from "react";
import {
  Save,
  AlertCircle,
  CheckCircle2,
  Copy,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { createClient } from "@/lib/client";

interface OperatingHour {
  id?: string;
  cardapios_id: string;
  day_of_week: number;
  opening_time: string;
  closing_time: string;
  is_active: boolean;
}

interface OperatingHoursManagerProps {
  cardapioId: string;
}

const DAYS_OF_WEEK = [
  "Domingo",
  "Segunda-feira",
  "Terça-feira",
  "Quarta-feira",
  "Quinta-feira",
  "Sexta-feira",
  "Sábado",
];

const DAYS_OF_WEEK_SHORT = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export default function OperatingHoursManager({
  cardapioId,
}: OperatingHoursManagerProps) {
  const [operatingHours, setOperatingHours] = useState<OperatingHour[]>([]);
  const [originalHours, setOriginalHours] = useState<OperatingHour[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [expandedDays, setExpandedDays] = useState<{ [key: number]: boolean }>(
    {}
  );
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const supabase = createClient();

  // Inicializar com horários padrão
  const initializeDefaultHours = (): OperatingHour[] => {
    return DAYS_OF_WEEK.map((_, index) => ({
      cardapios_id: cardapioId,
      day_of_week: index,
      opening_time: "08:00",
      closing_time: "18:00",
      is_active: index !== 0, // Domingo fechado por padrão
    }));
  };

  // Carregar horários existentes
  useEffect(() => {
    loadOperatingHours();
  }, [cardapioId]);

  const loadOperatingHours = async () => {
    if (!cardapioId) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("operating_hours")
        .select("*")
        .eq("cardapios_id", cardapioId)
        .order("day_of_week");

      if (error) {
        console.error("Erro ao carregar horários:", error);
        throw error;
      }

      if (data && data.length > 0) {
        setOperatingHours(data);
        setOriginalHours(JSON.parse(JSON.stringify(data))); // Deep copy
      } else {
        // Se não existir, inicializar com padrão
        const defaultHours = initializeDefaultHours();
        setOperatingHours(defaultHours);
        setOriginalHours(JSON.parse(JSON.stringify(defaultHours))); // Deep copy
      }
    } catch (error) {
      console.error("Erro ao carregar horários:", error);
      const defaultHours = initializeDefaultHours();
      setOperatingHours(defaultHours);
      setOriginalHours(JSON.parse(JSON.stringify(defaultHours))); // Deep copy
      showMessage(
        "error",
        "Erro ao carregar horários. Usando configuração padrão."
      );
    } finally {
      setLoading(false);
    }
  };

  const updateHour = (
    dayIndex: number,
    field: keyof OperatingHour,
    value: any
  ) => {
    setOperatingHours((prev) =>
      prev.map((hour) =>
        hour.day_of_week === dayIndex ? { ...hour, [field]: value } : hour
      )
    );
  };

  const validateHours = (): string[] => {
    const errors: string[] = [];

    operatingHours.forEach((hour) => {
      if (hour.is_active) {
        if (hour.opening_time >= hour.closing_time) {
          errors.push(
            `${
              DAYS_OF_WEEK[hour.day_of_week]
            }: Horário de abertura deve ser antes do fechamento`
          );
        }
      }
    });

    return errors;
  };

  const showMessage = (type: "success" | "error", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const saveOperatingHours = async () => {
    const errors = validateHours();
    if (errors.length > 0) {
      showMessage("error", errors.join(", "));
      return;
    }

    setSaving(true);
    try {
      // Processar cada horário individualmente
      for (const hour of operatingHours) {
        const hourData = {
          cardapios_id: hour.cardapios_id,
          day_of_week: hour.day_of_week,
          opening_time: hour.opening_time,
          closing_time: hour.closing_time,
          is_active: hour.is_active,
        };

        if (hour.id) {
          // Atualizar registro existente
          const { error } = await supabase
            .from("operating_hours")
            .update(hourData)
            .eq("id", hour.id);

          if (error) throw error;
        } else {
          // Inserir novo registro
          const { error } = await supabase
            .from("operating_hours")
            .insert(hourData);

          if (error) throw error;
        }
      }

      showMessage("success", "Horários salvos com sucesso!");
      loadOperatingHours(); // Recarregar para obter IDs atualizados
    } catch (error) {
      console.error("Erro ao salvar horários:", error);
      showMessage("error", "Erro ao salvar horários. Tente novamente.");
    } finally {
      setSaving(false);
    }
  };

  const cancelChanges = () => {
    setOperatingHours(JSON.parse(JSON.stringify(originalHours))); // Restaurar estado original
    showMessage("success", "Alterações canceladas.");
  };

  const copyHours = (sourceDay: number, targetDay: number) => {
    const sourceHour = operatingHours.find((h) => h.day_of_week === sourceDay);
    if (sourceHour) {
      updateHour(targetDay, "opening_time", sourceHour.opening_time);
      updateHour(targetDay, "closing_time", sourceHour.closing_time);
      updateHour(targetDay, "is_active", sourceHour.is_active);
    }
  };

  const copyToAllDays = (sourceDay: number) => {
    const sourceHour = operatingHours.find((h) => h.day_of_week === sourceDay);
    if (
      sourceHour &&
      confirm(
        `Copiar horário de ${DAYS_OF_WEEK[sourceDay]} para todos os outros dias?`
      )
    ) {
      operatingHours.forEach((hour) => {
        if (hour.day_of_week !== sourceDay) {
          copyHours(sourceDay, hour.day_of_week);
        }
      });
    }
  };

  const toggleDayExpansion = (dayIndex: number) => {
    setExpandedDays((prev) => ({
      ...prev,
      [dayIndex]: !prev[dayIndex],
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#059669]"></div>
          <span className="text-gray-600">Carregando horários...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6">
      {/* Estilos globais para time picker */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
          input[type="time"]::-webkit-datetime-edit-hour-field:focus,
          input[type="time"]::-webkit-datetime-edit-minute-field:focus {
            background-color: #059669 !important;
            color: white !important;
            border-radius: 4px !important;
          }
          
          input[type="time"]::-webkit-datetime-edit-hour-field:hover,
          input[type="time"]::-webkit-datetime-edit-minute-field:hover {
            background-color: #059669 !important;
            color: white !important;
            border-radius: 4px !important;
          }
          
          input[type="time"]::-webkit-datetime-edit-hour-field.selected,
          input[type="time"]::-webkit-datetime-edit-minute-field.selected {
            background-color: #059669 !important;
            color: white !important;
          }
          
          /* Para o dropdown do time picker */
          input[type="time"]::-webkit-calendar-picker-indicator:hover {
            background-color: #059669;
            border-radius: 4px;
          }
        `,
        }}
      />

      {/* Message */}
      {message && (
        <div
          className={`mb-4 sm:mb-6 p-4 rounded-lg flex items-center gap-3 ${
            message.type === "success"
              ? "bg-green-50 border border-green-200 text-green-800"
              : "bg-red-50 border border-red-200 text-red-800"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
          )}
          <span className="text-sm">{message.text}</span>
        </div>
      )}

      {/* Hours Configuration */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
          {operatingHours.map((hour, index) => (
            <div
              key={hour.day_of_week}
              className="border border-gray-200 rounded-lg overflow-hidden transition-colors hover:bg-gray-50"
            >
              {/* Desktop Layout */}
              <div className="hidden lg:flex items-center gap-4 p-4">
                {/* Checkbox para ativar/desativar */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id={`active-${index}`}
                    checked={hour.is_active}
                    onChange={(e) =>
                      updateHour(
                        hour.day_of_week,
                        "is_active",
                        e.target.checked
                      )
                    }
                    className="w-4 h-4 border-gray-300 rounded focus:ring-[#059669] accent-[#059669]"
                  />
                </div>

                {/* Nome do dia */}
                <div className="w-32">
                  <label
                    htmlFor={`active-${index}`}
                    className="font-medium text-gray-900 cursor-pointer"
                  >
                    {DAYS_OF_WEEK[hour.day_of_week]}
                  </label>
                </div>

                {/* Horários ou status fechado */}
                {hour.is_active ? (
                  <div className="flex items-center gap-4 flex-1">
                    <div className="flex items-center gap-2">
                      <label className="text-sm font-medium text-gray-700">
                        Abre:
                      </label>
                      <input
                        type="time"
                        value={hour.opening_time}
                        onChange={(e) =>
                          updateHour(
                            hour.day_of_week,
                            "opening_time",
                            e.target.value
                          )
                        }
                        style={{
                          colorScheme: "light",
                          accentColor: "#059669",
                        }}
                        className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-[#059669] focus:border-[#059669]"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="text-sm font-medium text-gray-700">
                        Fecha:
                      </label>
                      <input
                        type="time"
                        value={hour.closing_time}
                        onChange={(e) =>
                          updateHour(
                            hour.day_of_week,
                            "closing_time",
                            e.target.value
                          )
                        }
                        style={{
                          colorScheme: "light",
                          accentColor: "#059669",
                        }}
                        className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-[#059669] focus:border-[#059669]"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="flex-1">
                    <span className="text-gray-500 text-sm font-medium">
                      Fechado
                    </span>
                  </div>
                )}

                {/* Botão para copiar horário */}
                {hour.is_active && (
                  <div className="relative group">
                    <button
                      type="button"
                      className="text-xs text-gray-400 hover:text-gray-600 px-3 py-1.5 rounded border border-gray-200 hover:border-gray-300 flex items-center gap-1"
                      onClick={() => copyToAllDays(hour.day_of_week)}
                    >
                      <Copy className="w-3 h-3" />
                      Copiar
                    </button>
                  </div>
                )}
              </div>

              {/* Mobile/Tablet Layout */}
              <div className="lg:hidden">
                {/* Header com toggle */}
                <div
                  className="flex items-center justify-between p-4 cursor-pointer"
                  onClick={() => toggleDayExpansion(hour.day_of_week)}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={hour.is_active}
                      onChange={(e) => {
                        e.stopPropagation();
                        updateHour(
                          hour.day_of_week,
                          "is_active",
                          e.target.checked
                        );
                      }}
                      className="w-4 h-4 border-gray-300 rounded focus:ring-[#059669] accent-[#059669]"
                    />
                    <div>
                      <span className="font-medium text-gray-900 block sm:hidden">
                        {DAYS_OF_WEEK_SHORT[hour.day_of_week]}
                      </span>
                      <span className="font-medium text-gray-900 hidden sm:block">
                        {DAYS_OF_WEEK[hour.day_of_week]}
                      </span>
                      {hour.is_active && (
                        <span className="text-xs text-gray-500 block">
                          {hour.opening_time} - {hour.closing_time}
                        </span>
                      )}
                      {!hour.is_active && (
                        <span className="text-xs text-gray-500 block">
                          Fechado
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {hour.is_active && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          copyToAllDays(hour.day_of_week);
                        }}
                        className="text-xs text-gray-400 hover:text-gray-600 p-2 rounded border border-gray-200 hover:border-gray-300"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    )}
                    {expandedDays[hour.day_of_week] ? (
                      <ChevronUp className="w-4 h-4 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    )}
                  </div>
                </div>

                {/* Horários expandidos */}
                {(expandedDays[hour.day_of_week] || !hour.is_active) &&
                  hour.is_active && (
                    <div className="px-4 pb-4 space-y-3 border-t border-gray-100">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Horário de abertura
                          </label>
                          <input
                            type="time"
                            value={hour.opening_time}
                            onChange={(e) =>
                              updateHour(
                                hour.day_of_week,
                                "opening_time",
                                e.target.value
                              )
                            }
                            style={{
                              colorScheme: "light",
                              accentColor: "#059669",
                            }}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-[#059669] focus:border-[#059669]"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Horário de fechamento
                          </label>
                          <input
                            type="time"
                            value={hour.closing_time}
                            onChange={(e) =>
                              updateHour(
                                hour.day_of_week,
                                "closing_time",
                                e.target.value
                              )
                            }
                            style={{
                              colorScheme: "light",
                              accentColor: "#059669",
                            }}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-[#059669] focus:border-[#059669]"
                          />
                        </div>
                      </div>
                    </div>
                  )}
              </div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="px-4 sm:px-6 py-4 border-t border-gray-200 flex flex-col sm:flex-row justify-end gap-3 sm:gap-4">
          <button
            type="button"
            onClick={cancelChanges}
            className="w-full sm:w-auto px-4 sm:px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
          >
            Cancelar
          </button>
          <button
            onClick={saveOperatingHours}
            disabled={saving}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 text-sm font-medium text-white bg-emerald-600 border border-transparent rounded-lg hover:bg-emerald-700 focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Salvando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Salvar Configurações
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
