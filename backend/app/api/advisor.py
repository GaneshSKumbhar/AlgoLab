"""
Paradigm Advisor API routes.
"""
from fastapi import APIRouter, Depends
from app.auth.service import current_user
from app.models.schemas import AdvisorRequest, AdvisorResponse
from app.advisor.rules import ProblemCharacteristics, recommend

router = APIRouter(prefix="/api", tags=["advisor"])


@router.post("/advisor/recommend", response_model=AdvisorResponse)
def get_recommendation(req: AdvisorRequest, _: str = Depends(current_user)):
    chars = ProblemCharacteristics(
        is_graph_problem=req.is_graph_problem,
        is_optimization=req.is_optimization,
        needs_exact_solution=req.needs_exact_solution,
        has_overlapping_subproblems=req.has_overlapping_subproblems,
        has_optimal_substructure=req.has_optimal_substructure,
        has_greedy_choice_property=req.has_greedy_choice_property,
        needs_exhaustive_search=req.needs_exhaustive_search,
        is_weighted_graph=req.is_weighted_graph,
        has_negative_weights=req.has_negative_weights,
        is_directed=req.is_directed,
        is_dag=req.is_dag,
        is_bipartite=req.is_bipartite,
        needs_flow=req.needs_flow,
        needs_mst=req.needs_mst,
        needs_shortest_path=req.needs_shortest_path,
        needs_traversal=req.needs_traversal,
        needs_topological_order=req.needs_topological_order,
        input_size=req.input_size,
        num_variables=req.num_variables,
        has_constraints=req.has_constraints,
        is_partitioning=req.is_partitioning,
        is_scheduling=req.is_scheduling,
        is_assignment=req.is_assignment,
        is_covering=req.is_covering,
        is_tsp_like=req.is_tsp_like,
        is_knapsack_like=req.is_knapsack_like,
        is_string_problem=req.is_string_problem,
        is_sorting=req.is_sorting,
        is_searching=req.is_searching,
        suspected_np_hard=req.suspected_np_hard,
    )
    result = recommend(chars)
    return AdvisorResponse(**result)
