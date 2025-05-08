defmodule A2aAgentWebWeb.Router do
  @moduledoc """
  The main router for the A2aAgentWebWeb application.
  """
  use A2aAgentWebWeb, :router

  # Aliases for controller parent modules, to be used within the A2aAgentWebWeb scope
  alias A2aAgentWebWeb.Auth
  alias A2aAgentWebWeb.User

  # Import the authentication plug when it's created and ready to be used
  # alias A2aAgentWebWeb.Plugs.EnsureAuthenticated

  pipeline :browser do
    plug :accepts, ["html"]
  end

  pipeline :api do
    plug :accepts, ["json"]
  end

  # Pipeline for authenticated API routes
  # pipeline :api_authenticated do
  #   plug :accepts, ["json"]
  #   plug EnsureAuthenticated # This will be uncommented and used later
  # end

  scope "/", A2aAgentWebWeb do
    pipe_through :browser

    get "/*path", PageController, :spa_index # Serves index.html for SPA
    get "/metrics", MetricsController, :metrics
  end

  scope "/api", A2aAgentWebWeb do
    pipe_through :api

    # Authentication Endpoints (under /api/v1/auth as per design)
    # Controllers are referenced relative to the A2aAgentWebWeb scope
    scope "/v1/auth" do
      post "/register", Auth.AuthController, :register
      post "/login", Auth.AuthController, :login
      # The logout route will be protected by EnsureAuthenticated later
      post "/logout", Auth.AuthController, :logout
    end

    # User Endpoints (under /api/v1/users as per design)
    # Controllers are referenced relative to the A2aAgentWebWeb scope
    scope "/v1/users" do
      # This route will be protected by EnsureAuthenticated later
      get "/me/profile", User.UserController, :profile
    end

    # CTaaS v1 API Endpoints (Original)
    # These need to be checked if their controller definitions/aliases cause similar issues.
    # Assuming they are defined like A2aAgentWebWeb.TrialController and aliased as TrialController.
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
      post "/sites", SiteController, :create_site_globally
      get "/sites", SiteController, :index_sites_globally
      post "/trials/:trial_id/sites", SiteController, :associate_site_to_trial
      get "/trials/:trial_id/sites", SiteController, :index_trial_sites

      # Patients & Recruitment
      post "/trials/:trial_id/patients/identify", PatientController, :identify # Async
      get "/patients/identification-status/:task_id", PatientController, :identification_status
      get "/trials/:trial_id/patients", PatientController, :index_trial_patients
      post "/patients", PatientController, :create_patient_globally

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
    get "/metrics", MetricsController, :metrics
  end
end

