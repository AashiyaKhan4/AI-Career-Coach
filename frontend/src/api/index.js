import API from "./axiosInstance";

export const authAPI = {
  register:       (name, email, password) => API.post("/auth/register", { name, email, password }),
  login:          (email, password)       => API.post("/auth/login",    { email, password }),
  logout:         ()                      => API.post("/auth/logout"),
  me:             ()                      => API.get("/auth/me"),
  updateProfile:  (body)                  => API.patch("/user/profile", body),
  changePassword: (cur, next)             => API.patch("/user/change-password", { currentPassword: cur, newPassword: next }),
};

export const careerAPI = {
  list:        (params)    => API.get("/careers", { params }),
  getById:     (id)        => API.get(`/careers/${id}`),
  recommendations: ()      => API.get("/careers/recommendations"),
  recHistory:  ()          => API.get("/careers/recommendations/history"),
  updateRec:   (id, status)=> API.patch(`/careers/recommendations/${id}`, { status }),
  skillGapGet: (cid)       => API.get(`/careers/skill-gap/${cid}`),
  skillGapRun: (cid)       => API.post(`/careers/skill-gap/${cid}`),
};

export const skillAPI = {
  catalog: (params) => API.get("/skills", { params }),
  mine:    ()       => API.get("/user/skills"),
  add:     (skill_id, proficiency_level) => API.post("/user/skills", { skill_id, proficiency_level }),
  update:  (id, proficiency_level)       => API.patch(`/user/skills/${id}`, { proficiency_level }),
  remove:  (id)     => API.delete(`/user/skills/${id}`),
};

export const roadmapAPI = {
  list:           ()          => API.get("/roadmaps"),
  getById:        (id)        => API.get(`/roadmaps/${id}`),
  create:         (body)      => API.post("/roadmaps", body),
  remove:         (id)        => API.delete(`/roadmaps/${id}`),
  progress:       (id)        => API.get(`/roadmaps/${id}/progress`),
  updateResource: (rid, body) => API.post(`/roadmaps/resources/${rid}/progress`, body),
};

export const resumeAPI = {
  list:          ()              => API.get("/resumes"),
  getById:       (id)            => API.get(`/resumes/${id}`),
  create:        (body)          => API.post("/resumes", body),
  update:        (id, body)      => API.patch(`/resumes/${id}`, body),
  remove:        (id)            => API.delete(`/resumes/${id}`),
  addSection:    (id, body)      => API.post(`/resumes/${id}/sections`, body),
  updateSection: (id, sid, body) => API.patch(`/resumes/${id}/sections/${sid}`, body),
  removeSection: (id, sid)       => API.delete(`/resumes/${id}/sections/${sid}`),
  atsScore:      (id)            => API.post(`/resumes/${id}/ats-score`),
  aiImprove:     (id, body)      => API.post(`/resumes/${id}/ai-improve`, body),
};

export const interviewAPI = {
  list:      ()      => API.get("/interviews"),
  stats:     ()      => API.get("/interviews/stats"),
  getById:   (id)    => API.get(`/interviews/${id}`),
  questions: (id)    => API.get(`/interviews/${id}/questions`),
  start:     (body)  => API.post("/interviews/start", body),
  answer:    (id, body)   => API.post(`/interviews/${id}/answer`, body),
  complete:  (id, body)   => API.patch(`/interviews/${id}/complete`, body),
};
