defmodule A2aAgentWebWeb.SiteController do
  use A2aAgentWebWeb, :controller
  # Assuming a context module for Sites, e.g., A2aAgentWeb.Sites
  require Logger

  action_fallback A2aAgentWebWeb.FallbackController

  # POST /api/v1/sites
  def create_site_globally(conn, params) do
    site_details = Map.get(params, "site", %{})
    Logger.info("[SiteController] Received global site create request with details: #{inspect(site_details)}")
    # mock_site = Sites.create_site(site_details)
    mock_site = Map.merge(%{
      "id" => "site_" <> Ecto.UUID.generate(), 
      "status" => "active"
    }, site_details)
    conn
    |> put_status(:created)
    |> json(%{data: mock_site})
  end

  # GET /api/v1/sites
  def index_sites_globally(conn, params) do
    Logger.info("[SiteController] Received global site index request with params: #{inspect(params)}")
    # mock_sites = Sites.list_all_sites(params)
    mock_sites = [
      %{id: "site_main_001", name: "Main Clinical Center", location: "New York, USA"},
      %{id: "site_west_002", name: "West Coast Research Facility", location: "California, USA"}
    ]
    conn
    |> put_status(:ok)
    |> json(%{data: mock_sites})
  end

  # POST /api/v1/trials/:trial_id/sites
  def associate_site_to_trial(conn, %{"trial_id" => trial_id} = params) do
    association_details = Map.get(params, "association", %{})
    site_id = Map.get(association_details, "site_id")
    Logger.info("[SiteController] Received associate site request for trial_id: #{trial_id}, site_id: #{site_id} with details: #{inspect(association_details)}")
    # mock_association = Sites.associate_site_with_trial(trial_id, site_id, association_details)
    mock_association = %{
      trial_id: trial_id, 
      site_id: site_id, 
      onboarding_status: Map.get(association_details, "onboarding_status", "pending"),
      association_id: "assoc_" <> Ecto.UUID.generate()
    }
    conn
    |> put_status(:ok) # Or :created if a new association resource is made
    |> json(%{data: mock_association})
  end

  # GET /api/v1/trials/:trial_id/sites
  def index_trial_sites(conn, %{"trial_id" => trial_id} = params) do
    Logger.info("[SiteController] Received index request for sites in trial_id: #{trial_id} with params: #{inspect(params)}")
    # mock_trial_sites = Sites.list_sites_for_trial(trial_id, params)
    mock_trial_sites = [
      %{id: "site_main_001", name: "Main Clinical Center", onboarding_status: "active"},
      %{id: "site_aux_003", name: "Auxiliary Site Alpha", onboarding_status: "pending_activation"}
    ]
    conn
    |> put_status(:ok)
    |> json(%{data: mock_trial_sites})
  end
end

