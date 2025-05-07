defmodule A2aAgentWebWeb.IrbSubmissionController do
  use A2aAgentWebWeb, :controller
  # Assuming a context module for IrbSubmissions, e.g., A2aAgentWeb.IrbSubmissions
  require Logger

  action_fallback A2aAgentWebWeb.FallbackController

  def create(conn, %{"trial_id" => trial_id} = params) do
    submission_details = Map.get(params, "submission", %{})
    Logger.info("[IrbSubmissionController] Received create request for trial_id: #{trial_id} with details: #{inspect(submission_details)}")
    # mock_submission = IrbSubmissions.create_submission(trial_id, submission_details)
    mock_submission = Map.merge(%{
      "id" => "irb_sub_" <> Ecto.UUID.generate(), 
      "trial_id" => trial_id, 
      "status" => "submitted"
    }, submission_details)
    conn
    |> put_status(:created)
    |> json(%{data: mock_submission})
  end

  def index(conn, %{"trial_id" => trial_id} = params) do
    Logger.info("[IrbSubmissionController] Received index request for trial_id: #{trial_id} with params: #{inspect(params)}")
    # mock_submissions = IrbSubmissions.list_submissions_for_trial(trial_id, params)
    mock_submissions = [
      %{id: "irb_sub_abc123", trial_id: trial_id, status: "approved", submission_date: "2025-01-15"},
      %{id: "irb_sub_def456", trial_id: trial_id, status: "pending_review", submission_date: "2025-02-01"}
    ]
    conn
    |> put_status(:ok)
    |> json(%{data: mock_submissions})
  end

  def show(conn, %{"submission_id" => submission_id} = params) do
    Logger.info("[IrbSubmissionController] Received show request for submission_id: #{submission_id} with params: #{inspect(params)}")
    # mock_submission = IrbSubmissions.get_submission!(submission_id)
    mock_submission = %{id: submission_id, trial_id: "trial_xyz789", status: "approved", documents: ["doc1.pdf", "doc2.pdf"]}
    conn
    |> put_status(:ok)
    |> json(%{data: mock_submission})
  end

  def update(conn, %{"submission_id" => submission_id, "submission" => submission_params}) do
    Logger.info("[IrbSubmissionController] Received update request for submission_id: #{submission_id} with params: #{inspect(submission_params)}")
    # updated_submission = IrbSubmissions.update_submission(submission_id, submission_params)
    mock_updated_submission = Map.merge(%{id: submission_id, status: "under_review"}, submission_params)
    conn
    |> put_status(:ok)
    |> json(%{data: mock_updated_submission})
  end
end

