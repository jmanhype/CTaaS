defmodule A2aAgentWebWeb.PatientController do
  use A2aAgentWebWeb, :controller
  # Assuming context modules for Patients and a service for patient identification
  # e.g., A2aAgentWeb.Patients, A2aAgentWeb.RecruitmentService
  alias A2aAgentWeb.RecruitmentService # Placeholder for actual service
  require Logger

  action_fallback A2aAgentWebWeb.FallbackController

  # POST /api/v1/trials/:trial_id/patients/identify
  def identify(conn, %{"trial_id" => trial_id} = params) do
    recruitment_criteria = Map.get(params, "criteria", %{})
    Logger.info("[PatientController] Received patient identification request for trial_id: #{trial_id} with criteria: #{inspect(recruitment_criteria)}")

    # Initiate asynchronous patient identification via an agent/service
    # This would involve NATS messaging to EHRAgent and then a PatientMatchingAgent
    case RecruitmentService.initiate_patient_identification(trial_id, recruitment_criteria) do
      {:ok, task_info} ->
        conn
        |> put_status(:accepted)
        |> json(%{data: %{message: "Patient identification process initiated.", task_id: Map.get(task_info, :task_id, "task_pat_id_" <> Ecto.UUID.generate())}})
      {:error, reason} ->
        Logger.error("[PatientController] Failed to initiate patient identification: #{inspect(reason)}")
        conn
        |> put_status(:internal_server_error)
        |> json(%{error: %{message: "Failed to initiate patient identification: #{inspect(reason)}"}})
    end
  end

  # GET /api/v1/patients/identification-status/:task_id
  def identification_status(conn, %{"task_id" => task_id} = params) do
    Logger.info("[PatientController] Received patient identification status request for task_id: #{task_id} with params: #{inspect(params)}")
    # status = RecruitmentService.get_identification_status(task_id)
    mock_status = case rem(System.monotonic_time(:millisecond), 4) do
      0 -> "PENDING"
      1 -> "EHR_QUERY_IN_PROGRESS"
      2 -> "MATCHING_IN_PROGRESS"
      3 -> "COMPLETED"
    end
    mock_response = %{task_id: task_id, status: mock_status}
    mock_response = if mock_status == "COMPLETED", do: Map.put(mock_response, :identified_patients_count, Enum.random(1..20)), else: mock_response

    conn
    |> put_status(:ok)
    |> json(%{data: mock_response})
  end

  # GET /api/v1/trials/:trial_id/patients
  def index_trial_patients(conn, %{"trial_id" => trial_id} = params) do
    Logger.info("[PatientController] Received index request for patients in trial_id: #{trial_id} with params: #{inspect(params)}")
    # mock_trial_patients = Patients.list_patients_for_trial(trial_id, params)
    mock_trial_patients = [
      %{patient_id: "pat_001", trial_id: trial_id, status: "enrolled", enrollment_date: "2025-03-01"},
      %{patient_id: "pat_002", trial_id: trial_id, status: "identified_eligible", identification_date: "2025-02-20"}
    ]
    conn
    |> put_status(:ok)
    |> json(%{data: mock_trial_patients})
  end

  # POST /api/v1/patients
  def create_patient_globally(conn, params) do
    patient_details = Map.get(params, "patient", %{})
    Logger.info("[PatientController] Received global patient create request with details: #{inspect(patient_details)}")
    # mock_patient = Patients.create_patient(patient_details) # With consent and de-identification logic
    mock_patient = Map.merge(%{
      "id" => "pat_global_" <> Ecto.UUID.generate(),
      "status" => "registered"
    }, patient_details)
    conn
    |> put_status(:created)
    |> json(%{data: mock_patient})
  end
end

