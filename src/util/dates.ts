export function parseDate(dateString?: string): Date | null {
  const dateParts = dateString?.split('.')

  if (dateParts?.length !== 3) {
    return null
  }

  const day = parseInt(dateParts[0])
  const month = parseInt(dateParts[1]) - 1
  const year = parseInt(dateParts[2])

  const date = new Date(year, month, day)

  if (isNaN(date.getTime())) {
    return null
  }

  return date
}
