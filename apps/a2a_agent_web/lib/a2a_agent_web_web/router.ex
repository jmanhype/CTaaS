defmodule A2aAgentWebWeb.Router do
  @moduledoc """
  The main router for the A2aAgentWebWeb application.
  """
  use A2aAgentWebWeb, :router

  pipeline :browser do
    plug :accepts, ["html"]
  end

  pipeline :api do
    plug :accepts, ["json"]
  end

  scope "/", A2aAgentWebWeb do
    pipe_through :browser
    
    # Serve Next.js app for any route not matched by API or other specific Phoenix routes
    # This must be the LAST route in this scope to act as a catch-all for the SPA.
    get "/*path", PageController, :spa_index # Serves index.html for SPA

    # Prometheus metrics endpoint at root - ensure it's before the SPA catch-all if needed at root
    # If /metrics is intended to be served by Phoenix and not Next.js, keep it before /*path
    # However, if Next.js handles /metrics, this specific route might not be needed here.
    # For now, assuming /metrics is a backend endpoint and should be matched before SPA.
    get "/metrics", MetricsController, :metrics
  end

  scope "/api", A2aAgentWebWeb do
    pipe_through :api

    # CTaaS v1 API Endpoints
    scope "/v1" do
      # Trials
      post "/trials", TrialController, :create
      get "/trials", TrialController, :index
      get "/trials/:id", TrialController, :show
      put "/trials/:id", TrialController, :update
      delete "/trials/:id", TrialController, :delete

      # Protocols
      post "/trials/:trial_id/protocols/draft", ProtocolController, :draft # Async
      get "/trials/:trial_id/protocols", ProtocolController, :index
      get "/trials/:trial_id/protocols/:protocol_id", ProtocolController, :show
      get "/protocols/generation-status/:task_id", ProtocolController, :generation_status

      # IRB Submissions
      post "/trials/:trial_id/irb-submissions", IrbSubmissionController, :create
      get "/trials/:trial_id/irb-submissions", IrbSubmissionController, :index
      get "/irb-submissions/:submission_id", IrbSubmissionController, :show
      put "/irb-submissions/:submission_id", IrbSubmissionController, :update

      # Sites
      post "/sites", SiteController, :create_site_globally # Renamed to avoid conflict
      get "/sites", SiteController, :index_sites_globally # Renamed to avoid conflict
      post "/trials/:trial_id/sites", SiteController, :associate_site_to_trial
      get "/trials/:trial_id/sites", SiteController, :index_trial_sites

      # Patients & Recruitment
      post "/trials/:trial_id/patients/identify", PatientController, :identify # Async
      get "/patients/identification-status/:task_id", PatientController, :identification_status
      get "/trials/:trial_id/patients", PatientController, :index_trial_patients
      post "/patients", PatientController, :create_patient_globally # Renamed

      # Data Monitoring
      get "/trials/:trial_id/monitoring/summary", MonitoringController, :summary
      get "/trials/:trial_id/monitoring/events", MonitoringController, :events

      # Regulatory Reporting
      post "/trials/:trial_id/reports/generate", RegulatoryReportController, :generate # Async
      get "/reports/generation-status/:task_id", RegulatoryReportController, :generation_status
      get "/reports/:report_id", RegulatoryReportController, :download_report
    end

    # Orchestration endpoint
    post "/a2a", AgentController, :a2a

    # Simulation endpoint
    post "/simulate_workflow", SimulationController, :simulate

    # Summarization endpoint
    post "/summarize", SummarizerController, :summarize
    post "/story", StoryController, :create

    # Health/status endpoint
    get "/status", StatusController, :status

    # Agent card endpoints
    get "/agent_card", AgentController, :agent_card
    post "/agent_card", AgentController, :register_agent
    get "/agent_card/:id", AgentController, :get_agent

    # Agent registry endpoint
    get "/agent_registry", AgentController, :list_agents

    # Unregister agent endpoint
    delete "/agent_card/:id", AgentController, :unregister_agent

    # Operator introspection endpoints
    get "/operators", OperatorsController, :index
    get "/operators/:name", OperatorsController, :show

    # Model introspection endpoint
    get "/models", ModelsController, :index

    # Prometheus metrics endpoint
    # This is duplicated from the root scope. If /api/metrics is distinct, keep it.
    # Otherwise, rely on the root /metrics or ensure Next.js handles it if it's a frontend route.
    get "/metrics", MetricsController, :metrics
  end
end

