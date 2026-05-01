import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
async function main() {
  const wf = await prisma.workflow.create({
    data: {
      name: 'Patient Intake Form',
      description: 'Standard patient intake form for clinic visits',
      schemaColumns: {
        create: [
          { name: 'patient_name', label: 'Patient Name', dataType: 'text', required: true, order: 0 },
          { name: 'date_of_birth', label: 'Date of Birth', dataType: 'date', required: true, order: 1 },
          { name: 'gender', label: 'Gender', dataType: 'text', order: 2 },
          { name: 'phone_number', label: 'Phone Number', dataType: 'text', order: 3 },
          { name: 'visit_date', label: 'Visit Date', dataType: 'date', order: 4 },
        ]
      }
    }
  })
  console.log('Seeded workflow:', wf.name)
}
main().catch(console.error).finally(() => prisma.$disconnect())
