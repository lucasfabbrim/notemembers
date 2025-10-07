const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://noteplanning-backend.fly.dev"

interface ApiOptions extends RequestInit {
  token?: string
}

export async function apiClient<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
  const { token, ...fetchOptions } = options

  const headers: HeadersInit = {
    ...fetchOptions.headers,
  }

  if (fetchOptions.body) {
    headers["Content-Type"] = "application/json"
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`
  }

  const url = `${API_URL}${endpoint}`

  console.log("[v0] API Request:", {
    url,
    method: fetchOptions.method || "GET",
    hasToken: !!token,
    body: fetchOptions.body ? JSON.parse(fetchOptions.body as string) : null,
    headers: headers,
  })

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      headers,
      mode: "cors", // Add mode: 'cors' to explicitly handle CORS
    })

    console.log("[v0] API Response:", {
      url,
      status: response.status,
      ok: response.ok,
      statusText: response.statusText,
    })

    if (!response.ok) {
      let errorMessage = `Erro ${response.status}: ${response.statusText}`
      let errorData = null
      
      try {
        const responseText = await response.text()
        console.log("[v0] Raw error response text:", responseText)
        
        if (responseText) {
          errorData = JSON.parse(responseText)
          console.log("[v0] Parsed error data:", errorData)
          errorMessage = errorData.message || errorData.error || errorMessage
        }
      } catch (e) {
        console.error("[v0] Could not parse error response:", e)
      }
      
      console.error("[v0] Final error message:", errorMessage)
      throw new Error(errorMessage)
    }

    const data = await response.json()
    return data
  } catch (error: any) {
    console.error("[v0] API Error:", {
      url,
      error: error.message,
      type: error.name,
      stack: error.stack, // Include stack trace in the error log
    })
    throw error
  }
}

export const api = {
  auth: {
    register: (data: { name: string; email: string; password: string }) =>
      apiClient("/v1/auth/register", {
        method: "POST",
        body: JSON.stringify(data),
      }),
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
    // Categories
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
    // Videos
    createVideo: (categorySlug: string, data: any, token: string) => {
      console.log("[v0] API createVideo called with:", { 
        categorySlug, 
        data,
        endpoint: `/v1/categories/${categorySlug}/video`,
        method: "POST"
      })
      return apiClient(`/v1/categories/${categorySlug}/video`, {
        method: "POST",
        body: JSON.stringify(data),
        token,
      })
    },
    updateVideo: (categorySlug: string, videoSlug: string, data: any, token: string) =>
      apiClient(`/v1/categories/${categorySlug}/video/${videoSlug}`, {
        method: "PUT",
        body: JSON.stringify(data),
        token,
      }),
    deleteVideo: (categorySlug: string, videoSlug: string, token: string) =>
      apiClient(`/v1/categories/${categorySlug}/video/${videoSlug}`, {
        method: "DELETE",
        token,
      }),
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
