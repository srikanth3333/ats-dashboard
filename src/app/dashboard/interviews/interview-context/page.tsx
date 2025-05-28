"use client";

import { getListDataById, updateRecord } from "@/app/actions/action";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  ArrowRight,
  Book,
  Check,
  CheckCheck,
  Languages,
  Loader2,
  Plus,
  User2Icon,
  X,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import OpenAI from "openai";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

// Interfaces
interface Skill {
  id: string;
  name: string;
  selected: boolean;
}

interface Concept {
  name: string;
  difficulty: number;
  suggestions: string[];
  addedConcepts: string[];
  customConcept: string;
}

interface InterviewData {
  id: string;
  job_description: string;
  skills?: string[];
  concepts?: Concept[];
}

// Constants
const DEFAULT_MAX_SKILLS = 5;
const DEFAULT_CONCEPTS_PER_SKILL = 0;
const MAX_CONCEPTS_PER_SKILL = 10;
const MIN_SKILLS = 1;

// SkillSelection Component
const SkillSelection = React.memo<{
  skills: Skill[];
  maxSkills: number;
  toggleSkill: (skillName: string) => void;
  selectedCount: number;
}>(({ skills, maxSkills, toggleSkill, selectedCount }) => (
  <div className="mb-8">
    <div className="flex items-center mb-4">
      <div className="w-6 h-6 bg-green-100 rounded flex items-center justify-center mr-3">
        <div className="w-3 h-3 bg-green-500 rounded"></div>
      </div>
      <h2 className="text-xl font-semibold text-gray-900">
        Select skills{" "}
        <span className="text-gray-500 font-normal">
          ({MIN_SKILLS} - {maxSkills})
        </span>
      </h2>
    </div>

    <div className="flex flex-wrap gap-3">
      {skills.map((skill) => (
        <button
          key={skill.id}
          onClick={() => toggleSkill(skill.name)}
          disabled={
            (!skill.selected && selectedCount >= maxSkills) ||
            (skill.selected && selectedCount <= MIN_SKILLS)
          }
          className={`
            flex items-center px-4 py-2 rounded-full text-sm font-medium transition-all
            ${
              skill.selected
                ? "bg-gray-800 text-white"
                : selectedCount >= maxSkills
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }
            ${skill.selected && selectedCount <= MIN_SKILLS ? "cursor-not-allowed opacity-50" : ""}
          `}
        >
          {skill.selected && <Check className="w-4 h-4 mr-2" />}
          {skill.name}
          {skill.selected && <X className="w-4 h-4 ml-2 hover:text-gray-300" />}
          {!skill.selected && selectedCount < maxSkills && (
            <Plus className="w-4 h-4 ml-2" />
          )}
        </button>
      ))}
    </div>

    <p className="text-sm text-gray-500 mt-2">
      {selectedCount}/{maxSkills} skills selected
      {selectedCount < MIN_SKILLS && (
        <span className="text-red-500 ml-2">
          (Minimum {MIN_SKILLS} skill required)
        </span>
      )}
    </p>
  </div>
));

SkillSelection.displayName = "SkillSelection";

// ConceptCard Component
const ConceptCard = React.memo<{
  concept: Concept;
  removeConcept: (name: string) => void;
  updateCustomConcept: (name: string, value: string) => void;
  updateConceptDifficulty: (name: string, difficulty: number) => void;
  addSuggestionToConcept: (name: string, suggestion: string) => void;
  removeAddedConcept: (name: string, conceptToRemove: string) => void;
  addCustomConcept: (name: string) => void;
  isLoadingConcepts: boolean;
}>(
  ({
    concept,
    removeConcept,
    updateCustomConcept,
    updateConceptDifficulty,
    addSuggestionToConcept,
    removeAddedConcept,
    addCustomConcept,
    isLoadingConcepts,
  }) => {
    const getDifficultyLabel = useMemo(
      () => (difficulty: number) => {
        if (difficulty < 33) return "Easy";
        if (difficulty < 67) return "Moderate";
        return "Hard";
      },
      []
    );

    const getDifficultyColor = useMemo(
      () => (difficulty: number) => {
        if (difficulty < 33) return "text-green-600";
        if (difficulty < 67) return "text-blue-600";
        return "text-red-600";
      },
      []
    );

    const handleKeyPress = useCallback(
      (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && concept.customConcept.trim()) {
          addCustomConcept(concept.name);
        }
      },
      [addCustomConcept, concept.name, concept.customConcept]
    );

    const handleRemoveConcept = useCallback(() => {
      removeConcept(concept.name);
    }, [removeConcept, concept.name]);

    const handleUpdateCustomConcept = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        updateCustomConcept(concept.name, e.target.value);
      },
      [updateCustomConcept, concept.name]
    );

    const handleUpdateDifficulty = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        updateConceptDifficulty(concept.name, parseInt(e.target.value));
      },
      [updateConceptDifficulty, concept.name]
    );

    const handleAddCustomConcept = useCallback(() => {
      if (concept.customConcept.trim()) {
        addCustomConcept(concept.name);
      }
    }, [addCustomConcept, concept.name, concept.customConcept]);

    return (
      <div className="border border-gray-200 rounded-lg p-6 relative">
        {isLoadingConcepts && (
          <div className="absolute inset-0 bg-white bg-opacity-50 flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
          </div>
        )}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">{concept.name}</h3>
          <button
            onClick={handleRemoveConcept}
            className="text-gray-400 hover:text-gray-600"
            disabled={isLoadingConcepts}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Difficulty level:</span>
            <span
              className={`text-sm font-medium ${getDifficultyColor(
                concept.difficulty
              )}`}
            >
              {getDifficultyLabel(concept.difficulty)}
            </span>
          </div>
          <div className="relative">
            <input
              type="range"
              min="0"
              max="100"
              value={concept.difficulty}
              onChange={handleUpdateDifficulty}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              disabled={isLoadingConcepts}
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>Easy</span>
              <span>Hard</span>
            </div>
          </div>
        </div>

        <div className="flex gap-3 mb-4">
          <input
            type="text"
            placeholder="Add Concept"
            value={concept.customConcept}
            onChange={handleUpdateCustomConcept}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            onKeyPress={handleKeyPress}
            disabled={isLoadingConcepts}
          />
          <button
            onClick={handleAddCustomConcept}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center disabled:opacity-50"
            disabled={isLoadingConcepts || !concept.customConcept.trim()}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add
          </button>
        </div>

        {concept.suggestions.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              SUGGESTIONS
            </h4>
            <div className="flex flex-wrap gap-2">
              {concept.suggestions.map((suggestion, suggestionIndex) => (
                <button
                  key={suggestionIndex}
                  onClick={() =>
                    addSuggestionToConcept(concept.name, suggestion)
                  }
                  className="flex items-center px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 disabled:opacity-50"
                  disabled={isLoadingConcepts}
                >
                  {suggestion}
                  <Plus className="w-3 h-3 ml-2" />
                </button>
              ))}
            </div>
          </div>
        )}

        {concept.addedConcepts.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              ADDED CONCEPTS
            </h4>
            <div className="flex flex-wrap gap-2">
              {concept.addedConcepts.map((addedConcept, addedIndex) => (
                <span
                  key={addedIndex}
                  className="inline-flex items-center px-3 py-1 bg-gray-800 text-white rounded-full text-sm"
                >
                  <Check className="w-3 h-3 mr-2" />
                  {addedConcept}
                  <button
                    onClick={() =>
                      removeAddedConcept(concept.name, addedConcept)
                    }
                    className="ml-2 hover:text-gray-300"
                    disabled={isLoadingConcepts}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }
);

ConceptCard.displayName = "ConceptCard";

// Main Page Component
const CreateInterviewPage: React.FC = () => {
  const [jobDescription, setJobDescription] = useState<string>("");
  const [skills, setSkills] = useState<Skill[]>([]);
  const [concepts, setConcepts] = useState<Concept[]>([]);
  const [maxSkills] = useState<number>(DEFAULT_MAX_SKILLS);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLoadingConcepts, setIsLoadingConcepts] = useState<boolean>(false);
  const [dataFetched, setDataFetched] = useState<boolean>(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const skillsExtractedRef = useRef<boolean>(false);
  const conceptsInitializedRef = useRef<boolean>(false);

  const generateConcepts = useCallback(
    async (skillName: string): Promise<string[]> => {
      try {
        const prompt = `
          Generate up to ${MAX_CONCEPTS_PER_SKILL} relevant concepts or topics for ${skillName} in the context of a technical interview. Return the result in JSON format:
          
          {
            "concepts": string[]
          }
        `;

        const response = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [
            {
              role: "system",
              content:
                "You are a helpful assistant that generates relevant technical concepts for skills.",
            },
            { role: "user", content: prompt },
          ],
          response_format: { type: "json_object" },
        });

        const data = JSON.parse(response.choices[0].message.content || "{}");
        return data.concepts?.slice(0, MAX_CONCEPTS_PER_SKILL) || [];
      } catch (err) {
        console.error("Error generating concepts:", err);
        setError("Failed to generate concepts for skill: " + skillName);
        return [];
      }
    },
    []
  );

  const fetchData = useCallback(async () => {
    if (!id || dataFetched) return;

    try {
      setIsLoading(true);
      const result: any = await getListDataById("interviews", "*", id);
      if (result?.success && result.data) {
        setJobDescription(result.data.job_description || "");

        if (result.data.skills_required) {
          const fetchedSkills = result.data.skills_required.map(
            (skill: string, index: number) => ({
              id: `skill-${index}`,
              name: skill,
              selected: false, // Initially set all to false
            })
          );

          // Calculate how many skills to select dynamically
          const totalSkills = fetchedSkills.length;
          let skillsToSelect = Math.floor(totalSkills / 2); // Select half, rounded down

          // Ensure we don't select more than maxSkills or less than MIN_SKILLS
          skillsToSelect = Math.min(
            Math.max(skillsToSelect, MIN_SKILLS),
            maxSkills
          );

          // Select the first 'skillsToSelect' skills
          const updatedSkills = fetchedSkills.map(
            (skill: Skill, index: number) => ({
              ...skill,
              selected: index < skillsToSelect,
            })
          );

          setSkills(updatedSkills);
          skillsExtractedRef.current = true;
        }

        if (result.data.concepts) {
          setConcepts(result.data.concepts);
          conceptsInitializedRef.current = true;
        }

        setDataFetched(true);
      } else {
        setError("Failed to fetch interview data");
      }
    } catch (err) {
      setError("Failed to fetch interview data");
    } finally {
      setIsLoading(false);
    }
  }, [id, dataFetched, maxSkills]);

  const extractSkillsFromDescription = useCallback(
    async (description: string) => {
      if (!description || skillsExtractedRef.current) return;

      setIsLoading(true);
      try {
        const prompt = `
          Analyze the following job description and extract relevant technical skills in JSON format with the specified structure:
          
          {
            "skills": [{ "id": string, "label": string }]
          }
          
          - Suggest up to 8 relevant technical skills with lowercase hyphenated "id" and a readable "label".
          - If no skills can be determined, return an empty array.
          
          Job Description:
          ${description}
        `;

        const response = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [
            {
              role: "system",
              content:
                "You are a helpful assistant that extracts structured data and suggests relevant skills from job descriptions.",
            },
            { role: "user", content: prompt },
          ],
          response_format: { type: "json_object" },
        });

        const extractedData = JSON.parse(
          response.choices[0].message.content || "{}"
        );

        if (extractedData.skills?.length) {
          const newSkills = extractedData.skills.map(
            (skill: { id: string; label: string }) => ({
              id: skill.id,
              name: skill.label,
              selected: false,
            })
          );
          setSkills(newSkills);
          skillsExtractedRef.current = true;
        } else {
          setError("No skills could be extracted from the job description");
        }
      } catch (error) {
        console.error("Error fetching default skills from OpenAI:", error);
        setError("Failed to fetch skills from job description");
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const initializeConcepts = useCallback(async () => {
    if (conceptsInitializedRef.current) return;

    const selectedSkills = skills.filter((s) => s.selected);
    if (selectedSkills.length === 0) return;

    setIsLoadingConcepts(true);
    try {
      const newConcepts: Concept[] = [];

      for (const skill of selectedSkills) {
        const existingConcept = concepts.find((c) => c.name === skill.name);
        if (existingConcept) {
          newConcepts.push(existingConcept);
          continue;
        }

        const suggestions = await generateConcepts(skill.name);
        if (suggestions.length === 0) {
          setError(`No concepts generated for skill: ${skill.name}`);
          continue;
        }

        const defaultConcepts = suggestions.slice(
          0,
          DEFAULT_CONCEPTS_PER_SKILL
        );
        newConcepts.push({
          name: skill.name,
          difficulty: 60,
          suggestions: suggestions.filter((s) => !defaultConcepts.includes(s)),
          addedConcepts: defaultConcepts,
          customConcept: "",
        });
      }

      setConcepts(newConcepts);
      conceptsInitializedRef.current = true;
    } catch (err) {
      setError("Failed to initialize concepts");
    } finally {
      setIsLoadingConcepts(false);
    }
  }, [skills, concepts, generateConcepts]);

  const selectedCount = useMemo(() => {
    return skills.filter((s) => s.selected).length;
  }, [skills]);

  const toggleSkill = useCallback(
    (skillName: string) => {
      const currentSelectedCount = skills.filter((s) => s.selected).length;
      const skill = skills.find((s) => s.name === skillName);

      if (currentSelectedCount >= maxSkills && !skill?.selected) {
        setError(`Cannot select more than ${maxSkills} skills`);
        return;
      }

      if (skill?.selected && currentSelectedCount <= MIN_SKILLS) {
        setError(`At least ${MIN_SKILLS} skill must be selected`);
        return;
      }

      setSkills((prev) =>
        prev.map((skill) =>
          skill.name === skillName
            ? { ...skill, selected: !skill.selected }
            : skill
        )
      );

      conceptsInitializedRef.current = false;
      setError(null);
    },
    [skills, maxSkills]
  );

  const removeConcept = useCallback((conceptName: string) => {
    setConcepts((prev) =>
      prev.filter((concept) => concept.name !== conceptName)
    );
    setSkills((prev) =>
      prev.map((skill) =>
        skill.name === conceptName ? { ...skill, selected: false } : skill
      )
    );
    conceptsInitializedRef.current = false;
  }, []);

  const updateCustomConcept = useCallback(
    (conceptName: string, value: string) => {
      setConcepts((prev) =>
        prev.map((concept) =>
          concept.name === conceptName
            ? { ...concept, customConcept: value }
            : concept
        )
      );
    },
    []
  );

  const updateConceptDifficulty = useCallback(
    (conceptName: string, difficulty: number) => {
      setConcepts((prev) =>
        prev.map((concept) =>
          concept.name === conceptName ? { ...concept, difficulty } : concept
        )
      );
    },
    []
  );

  const addSuggestionToConcept = useCallback(
    (conceptName: string, suggestion: string) => {
      setConcepts((prev) =>
        prev.map((concept) => {
          if (concept.name === conceptName) {
            if (concept.addedConcepts.length >= MAX_CONCEPTS_PER_SKILL) {
              setError(
                `Cannot add more than ${MAX_CONCEPTS_PER_SKILL} concepts per skill`
              );
              return concept;
            }
            if (concept.addedConcepts.includes(suggestion)) {
              setError("This concept is already added");
              return concept;
            }
            return {
              ...concept,
              addedConcepts: [...concept.addedConcepts, suggestion],
              suggestions: concept.suggestions.filter((s) => s !== suggestion),
            };
          }
          return concept;
        })
      );
      setError(null);
    },
    []
  );

  const removeAddedConcept = useCallback(
    (conceptName: string, conceptToRemove: string) => {
      setConcepts((prev) =>
        prev.map((concept) => {
          if (concept.name === conceptName) {
            if (concept.addedConcepts.length <= 1) {
              setError("At least one concept must be selected per skill");
              return concept;
            }
            return {
              ...concept,
              addedConcepts: concept.addedConcepts.filter(
                (c) => c !== conceptToRemove
              ),
              suggestions: [...concept.suggestions, conceptToRemove].sort(),
            };
          }
          return concept;
        })
      );
      setError(null);
    },
    []
  );

  const addCustomConcept = useCallback((conceptName: string) => {
    setConcepts((prev) =>
      prev.map((concept) => {
        if (concept.name === conceptName && concept.customConcept.trim()) {
          if (concept.addedConcepts.length >= MAX_CONCEPTS_PER_SKILL) {
            setError(
              `Cannot add more than ${MAX_CONCEPTS_PER_SKILL} concepts per skill`
            );
            return concept;
          }
          if (
            concept.addedConcepts
              .map((c) => c.toLowerCase())
              .includes(concept.customConcept.trim().toLowerCase())
          ) {
            setError("This concept is already added");
            return concept;
          }
          return {
            ...concept,
            addedConcepts: [
              ...concept.addedConcepts,
              concept.customConcept.trim(),
            ],
            customConcept: "",
          };
        }
        return concept;
      })
    );
    setError(null);
  }, []);

  const handleNavigate = useCallback(async () => {
    if (!jobDescription || jobDescription.length < 50) {
      setError("Job description must be at least 50 characters");
      return;
    }
    if (!id) {
      setError("Invalid interview ID");
      return;
    }
    if (skills.filter((s) => s.selected).length < MIN_SKILLS) {
      setError(`Please select at least ${MIN_SKILLS} skill`);
      return;
    }
    if (concepts.some((c) => c.addedConcepts.length === 0)) {
      setError("Each selected skill must have at least one concept");
      return;
    }

    try {
      setIsLoading(true);
      const result = await updateRecord("interviews", id, {
        job_skills: skills.filter((s) => s.selected).map((s) => s.name),
        context: concepts,
      });
      if (result?.success && result.data) {
        router.push(`/dashboard/interviews/assessment-configuration?id=${id}`);
      } else {
        setError("Failed to save interview data");
      }
    } catch (err) {
      setError("Error saving interview data");
    } finally {
      setIsLoading(false);
    }
  }, [id, jobDescription, skills, concepts, router]);

  const handleGoBack = useCallback(() => {
    router.back();
  }, [router]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (
      jobDescription &&
      jobDescription.length >= 50 &&
      !skillsExtractedRef.current
    ) {
      const timeoutId = setTimeout(() => {
        extractSkillsFromDescription(jobDescription);
      }, 1000);
      return () => clearTimeout(timeoutId);
    }
  }, [jobDescription, extractSkillsFromDescription]);

  useEffect(() => {
    if (skills.length > 0 && skills.some((s) => s.selected)) {
      initializeConcepts();
    }
  }, [skills, initializeConcepts]);

  return (
    <div className="p-6">
      <div className="text-center font-semibold text-xl mb-6">
        Create New Interview
      </div>

      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      {isLoading && (
        <div className="bg-blue-100 text-blue-700 p-3 rounded-lg mb-4">
          <Loader2 className="w-5 h-5 inline-block mr-2 animate-spin" />
          Loading...
        </div>
      )}

      <div className="bg-white shadow-md rounded-xl p-4 mb-4">
        <div className="flex justify-between items-center">
          <div>
            <div className="flex gap-2 items-center">
              <Book />
              <div>
                <h2 className="text-lg font-semibold">Interview Context</h2>
                <p className="text-sm text-gray-500">
                  Next: Interview Configuration
                </p>
              </div>
            </div>
          </div>
          <div className="flex gap-2 items-center">
            {[1, 2, 3, 4, 5].map((item) => (
              <div key={item}>
                <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
                  <Check size={15} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex gap-2 mb-4 items-start">
        <div className="bg-white shadow-md flex-1 rounded-xl p-6">
          <div className="flex gap-2 items-center">
            <Languages />
            <h5 className="text-gray-600 text-sm uppercase">
              Interview Language
            </h5>
          </div>
          <div className="flex gap-2 items-center mt-3">
            <CheckCheck />
            <h5 className="font-semibold">English</h5>
          </div>
          <hr className="my-4" />
          <div className="flex gap-2 items-center">
            <User2Icon />
            <h5 className="text-gray-600 text-sm uppercase">AI Avatar</h5>
          </div>
          <div className="flex gap-2 items-center mt-3">
            <CheckCheck />
            <h5 className="font-semibold">Mike</h5>
          </div>
        </div>

        <div className="bg-white flex-2 shadow-md rounded-xl p-6">
          <SkillSelection
            skills={skills}
            maxSkills={maxSkills}
            toggleSkill={toggleSkill}
            selectedCount={selectedCount}
          />
          <div className="space-y-6">
            {concepts?.map((concept) => (
              <ConceptCard
                key={concept.name}
                concept={concept}
                removeConcept={removeConcept}
                updateCustomConcept={updateCustomConcept}
                updateConceptDifficulty={updateConceptDifficulty}
                addSuggestionToConcept={addSuggestionToConcept}
                removeAddedConcept={removeAddedConcept}
                addCustomConcept={addCustomConcept}
                isLoadingConcepts={isLoadingConcepts}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white shadow-md rounded-xl p-4 fixed bottom-0 left-0 right-0">
        <div className="flex justify-end gap-4 items-center">
          <Button variant="outline" onClick={handleGoBack} disabled={isLoading}>
            <ArrowLeft className="mr-2" /> Go Back
          </Button>
          <Button
            variant="animated"
            onClick={handleNavigate}
            disabled={isLoading || isLoadingConcepts}
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 inline-block mr-2 animate-spin" />
            ) : (
              <ArrowRight className="ml-2" />
            )}
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CreateInterviewPage;
