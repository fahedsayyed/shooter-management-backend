class ApiResponse {
    static success(data?: any) {
      return { success: true, data };
    }
  
    static failure(error?: string, message?: string) {
      return { success: false, error, message };
    }
  
    static status(code: number, data?: any) {
      return { status: code, data };
    }
    
    static statusfailure(code?: number, message?: any) {
      return { success: false, code, message };
    }

    static message(message: string) {
      return { error: "", message };
    }
  
    static info(data: any) {
      return { message: data };
    }
  
    static data(data: any) {
      return { data };
    }
  
    static pageInfo(pageInfo: any) {
      return { pageInfo };
    }
  }
  
  export default ApiResponse;
  