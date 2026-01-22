import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useNavigate } from "react-router-dom"
import { supabase } from "../../lib/supabase"
import { Loader2, Check } from "lucide-react"
import { Progress } from "../../components/ui/progress"

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../components/ui/form"
import { Input } from "../../components/ui/input"
import { Button } from "../../components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"

const formSchema = z.object({
  email: z.string().email({ message: "Correo inválido" }),
  password: z.string().min(6, { message: "Mínimo 6 caracteres" }),
  name: z.string().min(2, { message: "Debe tener al menos 2 caracteres" }),
  currency: z.string().min(1, { message: "Seleccioná una moneda" }),
  avatar: z.string().min(1, { message: "Seleccioná un avatar" })
})

type FormValues = z.infer<typeof formSchema>

const avatars = [
  "/avatars/avatar1.png", "/avatars/avatar2.png", "/avatars/avatar3.png",
  "/avatars/avatar4.png", "/avatars/avatar5.png", "/avatars/avatar6.png",
  "/avatars/avatar7.png", "/avatars/avatar8.png", "/avatars/avatar9.png",
  "/avatars/avatar10.png", "/avatars/avatar11.png", "/avatars/avatar12.png",
  "/avatars/default-avatar.png",
]

export function RegisterForm() {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const navigate = useNavigate()

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: "", password: "", name: "", currency: "ARS", avatar: "" },
  })

  const progressValue = (step / 5) * 100;

  const onSubmit = async (values: FormValues) => {
    setLoading(true)
    setError("")
    try {
      const { data, error } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: {
            full_name: values.name,
            avatar_url: values.avatar,
            currency: values.currency
          }
        }
      })
      if (error) throw error
      if (data.user) navigate("/login")
    } catch (err: any) {
      setError(err.message || "Ocurrió un error al crear la cuenta.")
    } finally {
      setLoading(false)
    }
  }

  const handleNext = async () => {
    const fieldsByStep: Record<number, (keyof FormValues)[]> = {
        1: ["email"], 2: ["password"], 3: ["name"], 4: ["currency"], 5: ["avatar"]
    }
    const isStepValid = await form.trigger(fieldsByStep[step])
    if (isStepValid) setStep(step + 1)
  }

  return (
    <div className="space-y-6">
      {/* Barra de Progreso */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs font-medium text-muted-foreground uppercase tracking-wider">
            <span>Paso {step} de 5</span>
            <span>{Math.round(progressValue)}% completado</span>
        </div>
        <Progress value={progressValue} className="h-1.5 bg-indigo-100" />
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {error && <div className="p-3 text-sm text-red-500 bg-red-50 rounded-lg border border-red-100">{error}</div>}

          <div className="min-h-[100px]">
            {step === 1 && (
                <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem>
                    <FormLabel>Correo electrónico</FormLabel>
                    <FormControl><Input placeholder="ejemplo@correo.com" className="h-11" {...field} /></FormControl>
                    <FormMessage />
                </FormItem>
                )} />
            )}

            {step === 2 && (
                <FormField control={form.control} name="password" render={({ field }) => (
                <FormItem>
                    <FormLabel>Crea una contraseña</FormLabel>
                    <FormControl><Input type="password" placeholder="Mínimo 6 caracteres" className="h-11" {...field} /></FormControl>
                    <FormMessage />
                </FormItem>
                )} />
            )}

            {step === 3 && (
                <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem>
                    <FormLabel>¿Cómo te llamas?</FormLabel>
                    <FormControl><Input placeholder="Tu nombre o apodo" className="h-11" {...field} /></FormControl>
                    <FormMessage />
                </FormItem>
                )} />
            )}

            {step === 4 && (
                <FormField control={form.control} name="currency" render={({ field }) => (
                <FormItem>
                    <FormLabel>Moneda de tu cuenta</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger className="h-11"><SelectValue placeholder="Seleccioná una moneda" /></SelectTrigger></FormControl>
                    <SelectContent>
                        <SelectItem value="ARS">ARS - Peso Argentino</SelectItem>
                        <SelectItem value="USD">USD - Dólar Estadounidense</SelectItem>
                        <SelectItem value="EUR">EUR - Euro</SelectItem>
                    </SelectContent>
                    </Select>
                    <FormMessage />
                </FormItem>
                )} />
            )}

            {step === 5 && (
                <FormField control={form.control} name="avatar" render={({ field }) => (
                <FormItem>
                    <FormLabel className="text-base">Elige tu avatar</FormLabel>
                    <div className="grid grid-cols-4 gap-3 max-h-[280px] overflow-y-auto p-1">
                    {avatars.map((src) => (
                        <div key={src} className="relative group">
                            <img
                            src={src}
                            alt="Avatar"
                            onClick={() => field.onChange(src)}
                            className={`w-full aspect-square rounded-xl border-2 cursor-pointer transition-all duration-200 object-cover ${field.value === src ? "border-indigo-600 scale-95 shadow-inner" : "border-gray-100 hover:border-indigo-200"}`}
                            />
                            {field.value === src && (
                                <div className="absolute -top-1 -right-1 bg-indigo-600 text-white rounded-full p-1 shadow-sm">
                                    <Check className="h-3 w-3" />
                                </div>
                            )}
                        </div>
                    ))}
                    </div>
                    <FormMessage />
                </FormItem>
                )} />
            )}
          </div>

          <div className="flex gap-3 pt-2">
            {step > 1 && (
              <Button type="button" variant="ghost" onClick={() => setStep(step - 1)} disabled={loading} className="flex-1 h-11">
                Atrás
              </Button>
            )}

            {step < 5 ? (
              <Button type="button" onClick={handleNext} className="flex-[2] h-11 bg-indigo-600 hover:bg-indigo-700">
                Siguiente
              </Button>
            ) : (
              <Button type="submit" disabled={loading} className="flex-[2] h-11 bg-indigo-600 hover:bg-indigo-700">
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Crear mi cuenta"}
              </Button>
            )}
          </div>
        </form>
      </Form>
    </div>
  )
}