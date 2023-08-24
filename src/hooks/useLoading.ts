import { useState } from 'react'

type ResultUseLoading = [(...args: any[]) => Promise<any>, boolean]

export const useLoading = (callback: Function) => {
	const [isLoading, setLoading] = useState(false)

	const handleSubmit = async (...args: any[]) => {
		setLoading(true)

		try {
			return await callback(...args)
		} catch (error: any) {
			throw new Error(error)
		} finally {
			setLoading(false)
		}
	}
	const result: ResultUseLoading = [handleSubmit, isLoading]
	return result
}
