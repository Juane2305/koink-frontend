import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import axios from "axios"
import { useNavigate } from "react-router-dom"

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../components/ui/form"
import { Input } from "../components/ui/input"
import { Button } from "../components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import { GoogleLoginButton } from "./GoogleLoginButton"

const formSchema = z.object({
  email: z.string().email({ message: "Correo inválido" }),
  password: z.string().min(6, { message: "Mínimo 6 caracteres" }),
  name: z.string().min(2, { message: "Debe tener al menos 2 caracteres" }),
  currency: z.string().min(1, { message: "Seleccioná una moneda" }),
})

type FormValues = z.infer<typeof formSchema>

export function RegisterForm() {
  const [step, setStep] = useState(1)
  const navigate = useNavigate()

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      name: "",
      currency: "",
    },
  })

  const onSubmit = async (values: FormValues) => {
    try {
      await axios.post("http://localhost:8080/api/auth/register", values)
      navigate("/login")
    } catch (error) {
      console.error("Error al registrar:", error)
    }
  }

  const handleNext = async () => {
    const currentField = ["email", "password", "name", "currency"][step - 1] as keyof FormValues
    const isStepValid = await form.trigger(currentField)
    if (isStepValid) setStep(step + 1)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {step === 1 && (
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="tu@email.com" {...field} />
                </FormControl>
                <FormMessage />
                <GoogleLoginButton/>
              </FormItem>
            )}
          />
        )}

        {step === 2 && (
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contraseña</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="******" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {step === 3 && (
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre completo</FormLabel>
                <FormControl>
                  <Input placeholder="Juan Pérez" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {step === 4 && (
          <FormField
            control={form.control}
            name="currency"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Moneda de preferencia</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccioná una moneda" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="ARS">ARS (Peso argentino)</SelectItem>
                    <SelectItem value="USD">USD (Dólar estadounidense)</SelectItem>
                    <SelectItem value="EUR">EUR (Euro)</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <div className="flex justify-between">
          {step > 1 && (
            <Button type="button" variant="outline" onClick={() => setStep(step - 1)}>
              Volver
            </Button>
          )}

          {step < 4 && (
            <Button type="button" onClick={handleNext}>
              Siguiente
            </Button>
          )}

          {step === 4 && (
            <Button type="submit">Crear cuenta</Button>
          )}
        </div>
      </form>
    </Form>
  )
}
