import { z } from "zod"

const CAS_REGEX = /^\d{2,7}-\d{2}-\d$/
const EC_REGEX = /^\d{3}-\d{3}-\d$/

/**
 * Validate CAS number format and checksum.
 * CAS checksum: sum of digits (without check digit) multiplied by ascending weights (1..n) from right to left.
 */
export function isValidCas(cas: string): boolean {
  if (!CAS_REGEX.test(cas)) return false

  const [_, body, suffix, checkDigit] = cas.match(/^(\d{2,7})-(\d{2})-(\d)$/) ?? []
  if (!body || !suffix) return false

  const digits = `${body}${suffix}`.split("").reverse()
  const checksum =
    digits.reduce((total, digit, index) => total + Number(digit) * (index + 1), 0) % 10

  return checksum === Number(checkDigit)
}

export const CasSchema = z
  .string()
  .regex(CAS_REGEX, "Format CAS invalide (ex: 10191-41-0)")
  .refine((value) => isValidCas(value), {
    message: "Le chiffre de contrôle du CAS est invalide",
  })

export const EcSchema = z
  .string()
  .regex(EC_REGEX, "Format EINECS/EC invalide (ex: 233-466-0)")

export const CasEcPairSchema = z.object({
  id: z.string().uuid(),
  cas: CasSchema,
  ec: EcSchema.optional(),
  sources: z
    .array(z.string().min(1, "Source requise"))
    .min(1, "Au moins une source est requise"),
  note: z
    .string()
    .trim()
    .max(500, "500 caractères max")
    .optional(),
})

export type CasSchemaType = z.infer<typeof CasSchema>
export type EcSchemaType = z.infer<typeof EcSchema>
export type CasEcPairSchemaType = z.infer<typeof CasEcPairSchema>
