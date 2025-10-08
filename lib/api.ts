const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://noteplanning-backend.fly.dev"

interface ApiOptions extends RequestInit {
  token?: string
}

export async function apiClient<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
  const { token, ...fetchOptions } = options

  const headers: Record<string, string> = {
    ...(fetchOptions.headers as Record<string, string>),
  }

  if (fetchOptions.body) {
    headers["Content-Type"] = "application/json"
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`
  }

  const url = `${API_URL}${endpoint}`

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      headers,
      mode: "cors",
    })

    if (!response.ok) {
      let errorMessage = `Erro ${response.status}: ${response.statusText}`
      let errorData = null
      let responseText = ""

      try {
        responseText = await response.text()

        if (responseText) {
          errorData = JSON.parse(responseText)
          errorMessage = errorData.message || errorData.error || errorData.details || errorMessage
        }
      } catch (e) {
        // Failed to parse response text
      }
      throw new Error(errorMessage)
    }

    const data = await response.json()
    return data
  } catch (error: any) {
    throw error
  }
}

export const api = {
  auth: {
    login: (data: { email: string; password: string }) =>
      apiClient<{ success: boolean; message: string; data: { token: string } }>("/v1/auth/login", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    logout: (token: string) =>
      apiClient("/v1/auth/logout", {
        method: "POST",
        body: JSON.stringify({}),
        token,
      }),
  },
  customers: {
    getProfile: (id: string, token: string) => apiClient(`/v1/customers/${id}`, { token }),
    getPurchases: (token: string) => apiClient("/v1/customers/purchases", { token }),
  },
  products: {
    getAll: (token?: string) => apiClient<{ success: boolean; data: any[] }>("/v1/products", { token }),
    create: (data: any, token: string) =>
      apiClient("/v1/products", {
        method: "POST",
        body: JSON.stringify(data),
        token,
      }),
    update: (id: string, data: any, token: string) =>
      apiClient(`/v1/products/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
        token,
      }),
    delete: (id: string, token: string) =>
      apiClient(`/v1/products/${id}`, {
        method: "DELETE",
        token,
      }),
  },
  categories: {
    getAll: (token?: string) => apiClient("/v1/categories", { token }),

    getVideos: (slug: string, token?: string) =>
      apiClient<{ success: boolean; data: { category: any; videos: any[]; pagination: any } }>(
        `/v1/categories/${slug}/videos`,
        { token },
      ),

    getVideo: (categorySlug: string, videoSlug: string, token?: string) =>
      apiClient<{ success: boolean; data: { category: any; video: any } }>(
        `/v1/categories/${categorySlug}/video/${videoSlug}`,
        { token },
      ),
  },

  admin: {

    getAllCategories: (token: string) =>
      apiClient<{ success: boolean; data: any[]; pagination: any }>("/v1/categories", { token }),

    createCategory: (data: any, token: string) =>
      apiClient("/v1/categories", {
        method: "POST",
        body: JSON.stringify(data),
        token,
      }),

    updateCategory: (slug: string, data: any, token: string) =>
      apiClient(`/v1/categories/${slug}`, {
        method: "PUT",
        body: JSON.stringify(data),
        token,
      }),

    deleteCategory: (slug: string, token: string) =>
      apiClient(`/v1/categories/${slug}`, {
        method: "DELETE",
        token,
      }),

    createVideo: (categorySlug: string, data: any, token: string) => {
      return apiClient(`/v1/categories/${categorySlug}/video`, {
        method: "POST",
        body: JSON.stringify(data),
        token,
      })
    },

    updateVideo: (categorySlug: string, videoSlug: string, data: any, token: string) => {
      return apiClient(`/v1/categories/${categorySlug}/video/${videoSlug}`, {
        method: "PUT",
        body: JSON.stringify(data),
        token,
      })
    },

    deleteVideo: (categorySlug: string, videoSlug: string, token: string) => {
      return apiClient(`/v1/categories/${categorySlug}/video/${videoSlug}`, {
        method: "DELETE",
        token,
      })
    },
    // Users
    getAllUsers: (token: string) =>
      apiClient<{ success: boolean; data: any[]; total: number }>("/v1/customers", { token }),
    updateUser: (id: string, data: any, token: string) => {
      const { id: _, ...payload } = data
      return apiClient(`/v1/customers/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
        token,
      })
    },
    deleteUser: (id: string, token: string) =>
      apiClient(`/v1/customers/${id}`, {
        method: "DELETE",
        token,
      }),
  },
}
