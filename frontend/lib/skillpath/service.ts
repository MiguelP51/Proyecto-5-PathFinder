import { mockSkillPaths } from "./mock-data";
import { SkillPath, SkillPathFilters } from "./types";

const simulateDelay = async () => {
    await new Promise((resolve) => setTimeout(resolve, 250));
};

export async function getSkillPaths(
    filters?: SkillPathFilters
): Promise<SkillPath[]> {
    await simulateDelay();

    let skillPaths = [...mockSkillPaths];

    if (filters?.subareaId) {
        skillPaths = skillPaths.filter(
            (skillPath) => skillPath.subareaId === filters.subareaId
        );
    }

    if (filters?.search && filters.search.trim().length > 0) {
        const searchTerm = filters.search.trim().toLowerCase();

        skillPaths = skillPaths.filter((skillPath) => {
            const titleMatch = skillPath.title.toLowerCase().includes(searchTerm);
            const platformMatch = skillPath.platform.toLowerCase().includes(searchTerm);
            const descriptionMatch = skillPath.description
                .toLowerCase()
                .includes(searchTerm);
            const skillMatch = skillPath.skills.some((skill) =>
                skill.name.toLowerCase().includes(searchTerm)
            );

            return titleMatch || platformMatch || descriptionMatch || skillMatch;
        });
    }

    if (filters?.difficulty && filters.difficulty !== "TODOS") {
        skillPaths = skillPaths.filter(
            (skillPath) => skillPath.difficulty === filters.difficulty
        );
    }

    if (filters?.status && filters.status !== "TODOS") {
        skillPaths = skillPaths.filter(
            (skillPath) => skillPath.status === filters.status
        );
    }

    return skillPaths;
}

export async function getSkillPathById(
    skillPathId: string
): Promise<SkillPath | null> {
    await simulateDelay();

    return (
        mockSkillPaths.find((skillPath) => skillPath.id === skillPathId) ?? null
    );
}

export async function getRecommendedSkillPathsBySubarea(
    subareaId: string
): Promise<SkillPath[]> {
    await simulateDelay();

    return mockSkillPaths.filter(
        (skillPath) =>
            skillPath.subareaId === subareaId && skillPath.isRecommended
    );
}