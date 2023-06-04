export function parseNumber(input?: string | null): number | null {
	if (!input) {
		return null
	}

	const parsedNumber = Number(input)

	if (isNaN(parsedNumber)) {
		return null
	}

	return parsedNumber
}

/**
 * This function will return the value of the attribute in the attributes array.
 * It expects the searchTerm to be in the format of "attribute: value" and returns
 * the value of the attribute.
 *
 * @param attribute The attribute to search for.
 * @param attributes The array of attributes to search through.
 * @param type Optional override of the type of the attribute to return.
 * @param delimiter Optional override of the delimiter to use.
 *
 * @returns The string value of the attribute or null if it is not found.
 *
 * @example getAttribute("attribute", ["attribute: value", "attribute2: value2"])
 * @example getAttribute("attribute", ["attribute: value", "attribute2: value2"], "number")
 * @example getAttribute("attribute", ["attribute: value", "attribute2: value2"], "number", "=")
 */
export function getAttribute<T extends string | number = string>(
	attribute: string,
	attributes?: string[],
	type: "number" | "string" = "string",
	delimiter: string = ":"
): T | null {
	if (!attributes) {
		return null
	}

	const attributeValue = attributes.find((val) => val.toLowerCase().includes(`${attribute.toLowerCase()}${delimiter}`))

	if (!attributeValue) {
		return null
	}

	return (
		type === "string"
			? attributeValue.split(delimiter)[1].trim().toLowerCase()
			: parseNumber(attributeValue.split(delimiter)[1].trim())
	) as T
}
