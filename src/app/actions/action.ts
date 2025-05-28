"use server";
import {
  CrudResponse,
  FetchTableDataParams,
  PaginatedResponse,
  TableData,
} from "@/types/supabaseTypes";
import { createClient } from "@/utils/supabase/server";
import { PostgrestError } from "@supabase/supabase-js";

export async function createRecord<T extends object>(
  tableName: string,
  data: TableData<T>
): Promise<CrudResponse<T>> {
  try {
    const supabase = await createClient();
    const { data: userDetails } = await supabase.auth.getUser();
    const userId = userDetails?.user?.id;
    const { data: createdData, error } = await supabase
      .from(tableName)
      .insert({ user_id: userId, ...data })
      .select("*")
      .single();

    if (error) {
      return { success: false, error: error, data: null };
    }

    return {
      data: (createdData as T) || null,
      success: true,
      error,
    };
  } catch (error) {
    console.error(`Error creating record in ${tableName}:`, error);
    return {
      data: null,
      success: false,
      error: error as PostgrestError,
    };
  }
}

export async function createRecordWithoutUser(
  tableName: string,
  data: TableData<any>
): Promise<CrudResponse<any>> {
  try {
    const supabase = await createClient();
    const { data: createdData, error } = await supabase
      .from(tableName)
      .insert({ ...data })
      .select("*")
      .single();

    if (error) {
      return { success: false, error: error, data: null };
    }

    return {
      data: createdData || null,
      success: true,
      error,
    };
  } catch (error) {
    console.error(`Error creating record in ${tableName}:`, error);
    return {
      data: null,
      success: false,
      error: error as PostgrestError,
    };
  }
}

export async function fetchTableData<T>({
  tableName,
  page = 1,
  pageSize = 10,
  columnToSort = "id",
  sortDirection = "asc",
  filters = {},
  searchTerm = "",
  searchColumns = [],
}: FetchTableDataParams): Promise<PaginatedResponse<T>> {
  try {
    const supabase = await createClient();
    // Calculate offset
    const offset = (page - 1) * pageSize;
    const { data: userDetails } = await supabase.auth.getUser();
    const userId = userDetails?.user?.id;
    // Start building the query with default filter
    let query = supabase
      .from(tableName)
      .select("*", { count: "exact" })
      .eq("user_id", userId);

    // Apply additional filters if any
    Object.entries(filters).forEach(([column, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        if (typeof value === "object" && value.operator && value.value) {
          const { operator, value: filterValue } = value;
          if (filterValue === "") {
            return;
          }

          if (["eq", "gt", "gte", "lt", "lte", "ne"].includes(operator)) {
            if (operator === "eq") {
              query = query.eq(column, filterValue);
            } else if (operator === "gt") {
              query = query.gt(column, filterValue);
            } else if (operator === "gte") {
              query = query.gte(column, filterValue);
            } else if (operator === "lt") {
              query = query.lt(column, filterValue);
            } else if (operator === "lte") {
              query = query.lte(column, filterValue);
            } else if (operator === "ne") {
              query = query.neq(column, filterValue);
            }
          } else if (operator === "ilike") {
            query = query.ilike(column, `%${filterValue}%`);
          }
        } else {
          // Default to equality filter
          query = query.eq(column, value);
        }
      }
    });

    // Apply search if provided
    if (searchTerm && searchColumns.length > 0) {
      const searchConditions = searchColumns.map((column) => {
        return `${column}.ilike.%${searchTerm}%`;
      });
      query = query.or(searchConditions.join(","));
    }

    // Create a separate query for counting
    const { count: totalCount } = await query;

    // Add pagination and sorting to main query
    query = query
      .order(columnToSort, { ascending: sortDirection === "asc" })
      .range(offset, offset + pageSize - 1);

    // Execute the main query
    const { data, error } = await query;

    if (error) {
      throw new Error(
        `Error fetching data from ${tableName}: ${error.message}`
      );
    }

    const totalItems = totalCount || 0;
    const totalPages = Math.ceil(totalItems / pageSize);

    return {
      data: data as T[],
      totalCount: totalItems,
      page,
      pageSize,
      totalPages,
    };
  } catch (error) {
    console.error("Error in fetchTableData:", error);
    throw error;
  }
}

export async function fetchTableDataWithForeignKey<T>({
  tableName,
  page = 1,
  pageSize = 10,
  columnToSort = "id",
  sortDirection = "asc",
  filters = {},
  searchTerm = "",
  searchColumns = [],
  foreignKeys = {},
  applyUserIdFilter = true,
  profileId,
  assignId,
  applyCurrentUser,
  includeNestedRelations = false, // New parameter to control nested relations
}: FetchTableDataParams): Promise<PaginatedResponse<T>> {
  try {
    const supabase = await createClient();
    const offset = (page - 1) * pageSize;
    let userId: string | undefined;
    if (applyUserIdFilter) {
      userId = profileId;
    }
    let selectFields;
    selectFields = [
      "*",
      ...Object.entries(foreignKeys).map(
        ([fk, fields]) => `${fk}:${fk}(${fields.join(",")})`
      ),
    ].join(",");

    let query = supabase
      .from(tableName)
      .select(selectFields, { count: "exact" });

    if (applyUserIdFilter && tableName === "job_posting") {
      query = query.or(`user_id.eq.${userId},assign.eq.${assignId}`);
    }

    if (applyUserIdFilter && tableName === "clients") {
      query = query.or(`user_id.eq.${userId},company_id.eq.${assignId}`);
    }

    if (applyUserIdFilter && tableName === "user_profile") {
      query = query.or(`company_id.eq.${assignId}`);
    }

    if (applyUserIdFilter && tableName === "candidates") {
      query = query.filter("company_id", "eq", assignId);
      if (applyCurrentUser) {
        query = query.filter("user_id", "eq", userId);
      }
    }

    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        if (typeof value === "object" && value.operator && value.value) {
          const { operator, value: filterValue } = value;
          if (filterValue === "") return;

          if (["eq", "gt", "gte", "lt", "lte", "ne"].includes(operator)) {
            query = query.filter(key, operator, filterValue);
          } else if (operator === "ilike") {
            query = query.ilike(key, `%${filterValue}%`);
          } else if (["contains"].includes(operator)) {
            query = query.contains(key, filterValue);
          }
        } else {
          query = query.eq(key, value);
        }
      }
    });

    // Apply search
    if (searchTerm && searchColumns.length > 0) {
      const searchConditions = searchColumns
        .filter((col) => typeof col === "string") // Ensure valid columns
        .map((column) => `${column}.ilike.%${searchTerm}%`);
      if (searchConditions.length > 0) {
        query = query.or(searchConditions.join(","));
      }
    }

    // Apply sorting and pagination
    query = query
      .order(columnToSort, { ascending: sortDirection === "asc" })
      .range(offset, offset + pageSize - 1);

    // Execute query
    const { data, error, count } = await query;
    if (error) {
      throw new Error(
        `Error fetching data from ${tableName}: ${error.message}`
      );
    }

    const totalItems = count || 0;
    const totalPages = Math.ceil(totalItems / pageSize);

    return {
      data: data as T[],
      totalCount: totalItems,
      page,
      pageSize,
      totalPages,
    };
  } catch (error) {
    console.error("Error in fetchTableData:", error);
    throw error;
  }
}

export async function fetchTableDataTotalCount({
  tableName,
  filters = {},
  searchTerm = "",
  searchColumns = [],
  foreignKeys = {},
  applyUserIdFilter = true,
  profileId,
  assignId,
  applyCurrentUser,
}: Omit<
  FetchTableDataParams,
  "page" | "pageSize" | "columnToSort" | "sortDirection"
>): Promise<number> {
  try {
    const supabase = await createClient();

    // Get user ID if applying user_id filter
    let userId: string | undefined;
    if (applyUserIdFilter) {
      userId = profileId;
    }

    const selectFields = [
      "*",
      ...Object.entries(foreignKeys).map(
        ([fk, fields]) => `${fk}:${fk}(${fields.join(",")})`
      ),
    ].join(",");

    let query = supabase
      .from(tableName)
      .select(selectFields, { count: "exact" });

    if (applyUserIdFilter && tableName === "job_posting") {
      query = query.or(`user_id.eq.${userId},assign.eq.${assignId}`);
    }

    if (applyUserIdFilter && tableName === "clients") {
      query = query.or(`user_id.eq.${userId},company_id.eq.${assignId}`);
    }

    if (applyUserIdFilter && tableName === "user_profile") {
      query = query.or(`company_id.eq.${assignId}`);
    }

    if (applyUserIdFilter && tableName === "candidates") {
      query = query.filter("company_id", "eq", assignId);
      if (applyCurrentUser) {
        query = query.filter("user_id", "eq", userId);
      }
    }
    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        if (typeof value === "object" && value.operator && value.value) {
          const { operator, value: filterValue } = value;
          if (filterValue === "") return;

          if (["eq", "gt", "gte", "lt", "lte", "ne"].includes(operator)) {
            query = query.filter(key, operator, filterValue);
          } else if (operator === "ilike") {
            query = query.ilike(key, `%${filterValue}%`);
          } else if (["contains"].includes(operator)) {
            query = query.contains(key, filterValue);
          }
        } else {
          query = query.eq(key, value);
        }
      }
    });

    // Apply search
    if (searchTerm && searchColumns.length > 0) {
      const searchConditions = searchColumns
        .filter((col) => typeof col === "string")
        .map((column) => `${column}.ilike.%${searchTerm}%`);
      if (searchConditions.length > 0) {
        query = query.or(searchConditions.join(","));
      }
    }

    // Execute query to get count only
    const { count, error } = await query;
    if (error) {
      throw new Error(
        `Error fetching count from ${tableName}: ${error.message}`
      );
    }

    return count || 0;
  } catch (error) {
    console.error("Error in fetchTableDataTotalCount:", error);
    throw error;
  }
}

export async function uploadResume(file: File) {
  try {
    if (!file) {
      return { error: "No file provided" };
    }

    // Allowed MIME types for PDF and DOCX
    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!allowedTypes.includes(file.type)) {
      return { error: "Only PDF and DOCX files are allowed" };
    }

    const supabase = await createClient();
    const fileExtension = file.name.split(".").pop()?.toLowerCase();
    const fileName = `resume-${Date.now()}-${file.name}`;

    const { error: uploadError } = await supabase.storage
      .from("resumes")
      .upload(fileName, file, {
        contentType: file.type,
        upsert: true,
      });
    if (uploadError) {
      return { error: uploadError.message };
    }

    const { data } = supabase.storage.from("resumes").getPublicUrl(fileName);

    return { data: { url: data.publicUrl }, error: null };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Upload failed" };
  }
}

export async function getListData<T>(
  dbName: string,
  selectItems: string,
  filters: any = [] // Optional filters array
) {
  try {
    const supabase = await createClient();
    let query = supabase
      .from(dbName)
      .select(selectItems)
      .order("created_at", { ascending: true });

    // Apply filters
    for (const filter of filters) {
      query = query.filter(filter.column, filter.operator, filter.value);
    }

    const { data, error } = await query;
    if (error) {
      console.error(`Error fetching from ${dbName}:`, error.message);
      return { success: false, error: error.message };
    }

    return {
      success: true,
      data: data as T[],
    };
  } catch (err) {
    console.error("Unexpected error:", err);
    return {
      success: false,
      error:
        err instanceof Error ? err.message : "An unexpected error occurred",
    };
  }
}

export async function getListDataById<T>(
  dbName: string,
  selectItems: string,
  id: string | number | undefined
) {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from(dbName)
      .select(selectItems)
      .eq("id", id)
      .order("created_at", { ascending: true })
      .maybeSingle();

    if (error) {
      console.error("Error fetching :", error.message);
      return { error: error.message, success: false };
    }

    return {
      success: true,
      data: data,
    };
  } catch (err) {
    console.error("Unexpected error:", err);
    return {
      success: false,
      data: null,
      error:
        err instanceof Error ? err.message : "An unexpected error occurred",
    };
  }
}

export async function getClientsList<T>() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("clients")
      .select("id, name")
      .order("name", { ascending: true });

    if (error) {
      console.error("Error fetching clients:", error.message);
      throw new Error(`Failed to fetch clients: ${error.message}`);
    }

    // Transform the data into combobox format
    const clientsList = data.map((client) => ({
      label: client.name,
      value: client.id?.toString(),
    }));

    return clientsList as T[];
  } catch (err) {
    console.error("Unexpected error:", err);
    throw new Error("An unexpected error occurred while fetching clients");
  }
}

export async function getAssignList<T>() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("user_profile")
      .select("id, name")
      .order("name", { ascending: true });
    if (error) {
      console.error("Error fetching clients:", error.message);
      throw new Error(`Failed to fetch clients: ${error.message}`);
    }
    const assignList = data.map((assign) => ({
      label: assign.name,
      value: assign.id?.toString(),
    }));

    return assignList as T[];
  } catch (err) {
    console.error("Unexpected error:", err);
    throw new Error("An unexpected error occurred while fetching clients");
  }
}

export async function getAssignJobPost<T>() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("job_posting")
      .select("id, role,skills,location, client(id,name)")
      .order("created_at", { ascending: true });
    if (error) {
      console.error("Error fetching clients:", error.message);
      throw new Error(`Failed to fetch clients: ${error.message}`);
    }

    return data as T[];
  } catch (err) {
    console.error("Unexpected error:", err);
    throw new Error("An unexpected error occurred while fetching clients");
  }
}

export async function updateRecord<T extends object>(
  tableName: string,
  id: string,
  data: Partial<T>
): Promise<{ success: boolean; error: PostgrestError | null; data: T | null }> {
  try {
    const supabase = await createClient();
    const { data: updatedData, error } = await supabase
      .from(tableName)
      .update({ ...data })
      .eq("id", id)
      .select("*")
      .single();

    if (error) {
      return { success: false, error, data: null };
    }

    return {
      data: updatedData as T,
      success: true,
      error: null,
    };
  } catch (error) {
    console.error(`Error updating record in ${tableName}:`, error);
    return {
      data: null,
      success: false,
      error: error as PostgrestError,
    };
  }
}

export async function fetchCandidateById(id: string) {
  try {
    const supabase = await createClient();
    const { data: userDetails } = await supabase.auth.getUser();
    const userId = userDetails?.user?.id;

    const { data, error } = await supabase
      .from("candidates")
      .select("*")
      .eq("user_id", userId)
      .eq("job_posting", id);

    if (error) {
      throw new Error(`Failed to fetch candidates: ${error.message}`);
    }

    return {
      success: true,
      data: data,
      error: null,
    };
  } catch (error) {
    console.error("Error fetching candidates:", error);
    return {
      success: false,
      data: [],
      error: error as PostgrestError,
    };
  }
}

export async function fetchCandidates() {
  try {
    const supabase = await createClient();
    const { data: userDetails } = await supabase.auth.getUser();
    const userId = userDetails?.user?.id;

    const { data, error } = await supabase
      .from("candidates")
      .select("id, name, email, job_status")
      .eq("user_id", userId);

    if (error) {
      throw new Error(`Failed to fetch candidates: ${error.message}`);
    }

    return {
      success: true,
      data: data.map((candidate: any) => ({
        ...candidate,
        id: candidate.id.toString(),
      })),
      error: null,
    };
  } catch (error) {
    console.error("Error fetching candidates:", error);
    return {
      success: false,
      data: [],
      error: error as PostgrestError,
    };
  }
}

export async function fetchInterviews({
  filterInterviewer = "all",
  filterType = "all",
  assignId,
  applyUserIdFilter,
  applyCurrentUser,
}: {
  filterInterviewer?: string;
  filterType?: string;
  assignId?: string;
  applyUserIdFilter?: boolean;
  applyCurrentUser?: boolean;
}) {
  try {
    const supabase = await createClient();
    const { data: userDetails } = await supabase.auth.getUser();
    const userId = userDetails?.user?.id;

    let query = supabase.from("interview_schedule").select("*");

    if (applyUserIdFilter) {
      query = query.filter("company_id", "eq", assignId);
      if (applyCurrentUser) {
        query = query.filter("user_id", "eq", userId);
      }
    }

    if (filterInterviewer !== "all") {
      query = query.eq("interviewer", filterInterviewer);
    }
    if (filterType !== "all") {
      query = query.eq("type", filterType);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch interviews: ${error.message}`);
    }

    return {
      success: true,
      data: data.map((interview: any) => ({
        ...interview,
        id: interview.id.toString(),
        candidate_id: interview.candidate_id.toString(),
        scheduled_at: interview.scheduled_at,
      })),
      error: null,
    };
  } catch (error) {
    console.error("Error fetching interviews:", error);
    return {
      success: false,
      data: [],
      error: error as PostgrestError,
    };
  }
}

export async function scheduleInterview(interviewData: {
  candidate_id: string;
  name: string;
  job_title: string;
  interviewer: string;
  scheduled_at: string;
  duration: number;
  type: "phone" | "video" | "in-person";
}) {
  try {
    const supabase = await createClient();
    const { data: userDetails } = await supabase.auth.getUser();
    const userId = userDetails?.user?.id;

    const { data, error } = await supabase
      .from("interview_schedule")
      .insert([{ ...interviewData }])
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to schedule interview: ${error.message}`);
    }

    const { error: statusError } = await supabase
      .from("candidates")
      .update({ job_status: "interviewScheduled" })
      .eq("id", interviewData.candidate_id);

    if (statusError) {
      console.error("Error updating candidate status:", statusError);
      return {
        success: false,
        data: null,
        error: statusError,
      };
    }

    return {
      success: true,
      data: {
        ...data,
        id: data.id.toString(),
        candidate_id: data.candidate_id.toString(),
      },
      error: null,
    };
  } catch (error) {
    console.error("Error scheduling interview:", error);
    return {
      success: false,
      data: null,
      error: error as PostgrestError,
    };
  }
}

export async function currentUser() {
  try {
    const supabase = await createClient();
    const { data: userDetails, error: authError } =
      await supabase.auth.getUser();

    if (authError || !userDetails?.user) {
      console.log("Auth error or no user:", authError);
      return {
        success: false,
        data: null,
        error: authError || new Error("No user found"),
      };
    }

    const userId = userDetails.user.id;
    const { data: userProfile, error: statusError } = await supabase
      .from("user_profile")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    const { data: company, error: companyError } = await supabase
      .from("company")
      .select("*")
      .eq("id", userProfile?.company_id)
      .maybeSingle();

    if (statusError || companyError) {
      console.log("Profile fetch error:", statusError);
      return {
        success: false,
        data: null,
        error: statusError,
      };
    }

    return {
      success: true,
      data: {
        userProfile,
        user: userDetails.user,
        company: company,
      },
      error: null,
    };
  } catch (error) {
    console.error("Unexpected error in currentUser:", error);
    return {
      success: false,
      data: null,
      error: error as Error, // Use generic Error type for safety
    };
  }
}

export async function uploadVideoBlob(
  blob: Blob
): Promise<{ url: string | null; error: string | null }> {
  try {
    const file = new File([blob], `recording-${Date.now()}.webm`, {
      type: "video/webm",
    });

    const filePath = `recordings/${file.name}`;
    const supabase = await createClient();
    const { error: uploadError } = await supabase.storage
      .from("videos") // Make sure the bucket is named "videos"
      .upload(filePath, file, {
        contentType: "video/webm",
        upsert: false,
      });

    if (uploadError) {
      return { url: null, error: uploadError.message };
    }

    const { data } = supabase.storage.from("videos").getPublicUrl(filePath);
    return { url: data.publicUrl, error: null };
  } catch (err: any) {
    return {
      url: null,
      error: err.message || "Unexpected error during upload.",
    };
  }
}
