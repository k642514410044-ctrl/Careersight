/* =========================================================
   Career Sight — dữ liệu minh họa (placeholder)
   Thay bằng dữ liệu thật từ kho chỉ số. Mọi trang đọc từ window.CS_DATA.
   ========================================================= */
window.CS_DATA = (function () {
  const meta = {
    totalJD: 6060,
    version: "v0.3-demo",
    updated: "28/09/2026",
    window: "12 tháng gần nhất",
    sources: ["Bộ dữ liệu học thuật công khai (VietJobs)", "Data feed thương mại (dự kiến)", "JD người dùng dán & đồng ý chia sẻ"]
  };

  const industries = [
    { key: "data", label: "Dữ liệu & AI" },
    { key: "marketing", label: "Marketing" },
    { key: "finance", label: "Tài chính - Kế toán" },
    { key: "logistics", label: "Logistics" },
    { key: "design", label: "Thiết kế" }
  ];

  const types = {
    "chuyen-mon": "Chuyên môn",
    "cong-cu": "Công cụ",
    "mem": "Kỹ năng mềm",
    "ngoai-ngu": "Ngoại ngữ"
  };

  const levels = ["Thực tập", "Fresher", "Junior", "Senior"];
  const locations = ["Toàn quốc", "Hà Nội", "TP.HCM", "Đà Nẵng", "Remote"];

  /* ---------- Danh mục kỹ năng chuẩn ----------
     group: nhóm cha — kỹ năng cùng group được tính "tương đương" (khớp 0,5)
     trend: thay đổi tần suất so với kỳ trước (điểm %)
     salary: chênh lệch lương trung bình (triệu/tháng) — null nếu chưa đủ mẫu */
  const S = (id, name, type, group, hours, o) => Object.assign({
    id, name, type, group, hours, prereq: [], related: [], aliases: [], trend: 0, desc: "", project: "", salary: null
  }, o);

  const list = [
    S("sql", "SQL", "cong-cu", "query", 40, { aliases: ["mysql", "postgresql", "t-sql", "truy vấn"], trend: 3, related: ["excel", "powerbi", "tableau", "dbt"], desc: "Ngôn ngữ truy vấn dữ liệu quan hệ — nền tảng của hầu hết vị trí phân tích dữ liệu.", project: "Viết 10 truy vấn phân tích doanh số trên bộ dữ liệu bán lẻ mẫu.", salary: 2.5 }),
    S("excel", "Excel", "cong-cu", "spreadsheet", 25, { aliases: ["ms excel", "microsoft excel", "google sheets", "pivot"], trend: -2, related: ["sql", "powerbi"], desc: "Bảng tính, Pivot Table, hàm tra cứu — công cụ phổ thông nhất trong JD văn phòng." }),
    S("python", "Python", "cong-cu", "programming", 60, { trend: 5, related: ["pandas", "sql", "ml"], desc: "Ngôn ngữ lập trình phổ biến cho phân tích, tự động hóa và học máy.", project: "Tự động hóa báo cáo tuần bằng script Python đọc file Excel.", salary: 3 }),
    S("pandas", "Pandas", "cong-cu", "programming", 25, { prereq: ["python"], trend: 2, related: ["python", "statistics"], desc: "Thư viện xử lý dữ liệu dạng bảng trong Python." }),
    S("powerbi", "Power BI", "cong-cu", "bi", 30, { aliases: ["power bi", "dax"], trend: 6, related: ["excel", "sql", "tableau"], desc: "Công cụ trực quan hóa và dựng dashboard của Microsoft.", project: "Dựng dashboard doanh thu 3 trang từ dữ liệu bán hàng mẫu." }),
    S("tableau", "Tableau", "cong-cu", "bi", 30, { trend: 1, related: ["sql", "powerbi", "excel"], desc: "Công cụ trực quan hóa dữ liệu; tương đương Power BI trong nhóm BI.", project: "Dựng 2 dashboard từ dữ liệu bán hàng mẫu và đăng lên Tableau Public.", salary: 1.5 }),
    S("statistics", "Thống kê & A/B testing", "chuyen-mon", "stats", 50, { aliases: ["thống kê", "a/b test", "ab testing", "hypothesis"], trend: 2, related: ["python", "ml"], desc: "Kiểm định giả thuyết, thiết kế thí nghiệm, diễn giải kết quả.", project: "Phân tích một thí nghiệm A/B trực tuyến và viết báo cáo kết luận." }),
    S("dbt", "dbt", "cong-cu", "transform", 20, { prereq: ["sql"], trend: 7, related: ["sql", "bigquery", "airflow"], desc: "Công cụ biến đổi dữ liệu trong kho bằng SQL có kiểm thử và phiên bản.", project: "Chuẩn hóa dữ liệu thô và kiểm thử mô hình bằng dbt." }),
    S("bigquery", "Google BigQuery", "cong-cu", "warehouse", 20, { aliases: ["bigquery", "snowflake", "redshift"], prereq: ["sql"], trend: 4, related: ["sql", "dbt", "cloud"], desc: "Kho dữ liệu đám mây của Google." }),
    S("airflow", "Apache Airflow", "cong-cu", "orchestration", 30, { prereq: ["python"], trend: 3, related: ["python", "dbt", "spark"], desc: "Điều phối và lập lịch pipeline dữ liệu." }),
    S("spark", "Apache Spark", "cong-cu", "bigdata", 45, { aliases: ["pyspark"], prereq: ["python"], trend: 1, related: ["python", "airflow", "cloud"], desc: "Xử lý dữ liệu lớn phân tán." }),
    S("cloud", "Cloud (AWS / GCP)", "cong-cu", "cloud", 40, { aliases: ["aws", "gcp", "azure"], trend: 4, related: ["bigquery", "spark"], desc: "Dịch vụ hạ tầng và dữ liệu trên đám mây." }),
    S("ml", "Machine Learning", "chuyen-mon", "ml", 80, { aliases: ["học máy", "scikit-learn", "machine learning"], prereq: ["python", "statistics"], trend: 8, related: ["python", "statistics", "pandas"], desc: "Xây dựng và đánh giá mô hình dự đoán.", salary: 4 }),
    S("datamodel", "Mô hình hóa dữ liệu", "chuyen-mon", "modeling", 30, { aliases: ["data modeling", "star schema"], prereq: ["sql"], related: ["sql", "dbt"], desc: "Thiết kế bảng sự kiện, bảng chiều cho kho dữ liệu." }),
    S("git", "Git", "cong-cu", "vcs", 10, { aliases: ["github", "gitlab"], related: ["python"], desc: "Quản lý phiên bản mã nguồn." }),
    S("reqanalysis", "Phân tích yêu cầu", "chuyen-mon", "ba", 30, { aliases: ["requirement", "user story"], related: ["brd", "jira"], desc: "Thu thập, làm rõ và đặc tả yêu cầu nghiệp vụ." }),
    S("brd", "Tài liệu BRD / SRS", "chuyen-mon", "ba", 20, { aliases: ["brd", "srs"], related: ["reqanalysis", "jira"], desc: "Viết tài liệu yêu cầu nghiệp vụ và đặc tả hệ thống." }),
    S("jira", "Jira / Confluence", "cong-cu", "pm-tool", 8, { aliases: ["jira", "confluence"], related: ["brd"], desc: "Quản lý công việc và tài liệu theo Agile." }),
    S("communication", "Giao tiếp & trình bày", "mem", "soft-comm", 20, { aliases: ["giao tiếp", "thuyết trình", "presentation"], related: ["teamwork"], desc: "Trình bày kết quả rõ ràng cho người không chuyên." }),
    S("teamwork", "Làm việc nhóm", "mem", "soft-team", 10, { aliases: ["teamwork", "làm việc nhóm"], related: ["communication"], desc: "Phối hợp với các bên trong dự án." }),
    S("english", "Tiếng Anh (B2)", "ngoai-ngu", "lang-en", 120, { aliases: ["tiếng anh", "english", "ielts", "toeic"], trend: 1, desc: "Đọc tài liệu và giao tiếp công việc bằng tiếng Anh.", salary: 2 }),
    S("seo", "SEO", "chuyen-mon", "seo", 30, { trend: -1, related: ["content", "ga4"], desc: "Tối ưu hiển thị trên công cụ tìm kiếm." }),
    S("googleads", "Google Ads", "cong-cu", "ads", 20, { related: ["metaads", "ga4"], desc: "Quảng cáo tìm kiếm và hiển thị của Google." }),
    S("metaads", "Meta Ads", "cong-cu", "ads", 20, { aliases: ["facebook ads"], trend: -3, related: ["googleads", "content"], desc: "Quảng cáo trên Facebook và Instagram." }),
    S("ga4", "Google Analytics 4", "cong-cu", "web-analytics", 15, { aliases: ["google analytics", "ga4"], trend: 5, related: ["googleads", "seo"], desc: "Đo lường hành vi người dùng trên web và app." }),
    S("content", "Content marketing", "chuyen-mon", "content", 30, { aliases: ["content", "copywriting"], related: ["seo", "metaads"], desc: "Lên kế hoạch và sản xuất nội dung." }),
    S("accounting", "Nguyên lý kế toán (VAS)", "chuyen-mon", "acc", 60, { aliases: ["vas", "kế toán"], related: ["tax", "misa"], desc: "Hạch toán theo chuẩn mực kế toán Việt Nam." }),
    S("misa", "MISA", "cong-cu", "acc-soft", 10, { aliases: ["phần mềm kế toán"], related: ["accounting"], desc: "Phần mềm kế toán phổ biến tại Việt Nam." }),
    S("tax", "Thuế (GTGT, TNDN, TNCN)", "chuyen-mon", "tax", 40, { aliases: ["thuế"], trend: 1, related: ["accounting"], desc: "Kê khai và quyết toán các loại thuế." }),
    S("ifrs", "IFRS", "chuyen-mon", "acc-intl", 80, { trend: 6, prereq: ["accounting"], related: ["accounting", "english"], desc: "Chuẩn mực báo cáo tài chính quốc tế.", salary: 3.5 }),
    S("erp", "SAP / ERP", "cong-cu", "erp", 30, { aliases: ["sap", "erp", "oracle"], trend: 2, related: ["supplychain", "excel"], desc: "Hệ thống hoạch định nguồn lực doanh nghiệp." }),
    S("supplychain", "Quản lý chuỗi cung ứng", "chuyen-mon", "scm", 40, { aliases: ["supply chain", "scm"], related: ["erp", "incoterms"], desc: "Lập kế hoạch mua hàng, tồn kho, vận chuyển." }),
    S("incoterms", "Incoterms & chứng từ XNK", "chuyen-mon", "xnk", 25, { aliases: ["incoterms", "xuất nhập khẩu"], related: ["supplychain", "english"], desc: "Điều kiện giao hàng và bộ chứng từ xuất nhập khẩu." }),
    S("figma", "Figma", "cong-cu", "design-tool", 20, { trend: 4, related: ["prototyping", "uxresearch"], desc: "Công cụ thiết kế giao diện cộng tác." }),
    S("adobe", "Photoshop / Illustrator", "cong-cu", "design-tool", 30, { aliases: ["photoshop", "illustrator", "adobe"], trend: -2, related: ["figma"], desc: "Bộ công cụ đồ họa của Adobe." }),
    S("uxresearch", "Nghiên cứu người dùng", "chuyen-mon", "ux", 35, { aliases: ["ux research", "phỏng vấn người dùng"], trend: 3, related: ["prototyping", "figma"], desc: "Phỏng vấn, kiểm thử khả dụng, tổng hợp insight." }),
    S("prototyping", "Wireframe & prototype", "chuyen-mon", "ux-proto", 25, { aliases: ["wireframe", "prototype"], prereq: ["figma"], related: ["figma", "uxresearch"], desc: "Phác thảo luồng và dựng bản mẫu tương tác." })
  ];
  const skills = {};
  list.forEach(s => (skills[s.id] = s));

  /* ---------- Vị trí: tần suất kỹ năng & mức yêu cầu ---------- */
  const P = (id, name, industry, jd, sk, related) => ({
    id, name, industry, jd, related: related || [],
    skills: sk.map(([sid, freq, req]) => ({ id: sid, freq, req: req || "bat-buoc" }))
  });
  const positions = [
    P("data-analyst", "Data Analyst", "data", 1120, [
      ["sql", .82], ["python", .74], ["excel", .63], ["tableau", .61], ["statistics", .54], ["powerbi", .51],
      ["communication", .45], ["english", .40, "uu-tien"], ["dbt", .38, "uu-tien"], ["bigquery", .33, "uu-tien"],
      ["pandas", .30, "uu-tien"], ["git", .25, "uu-tien"], ["airflow", .22, "uu-tien"]
    ], ["business-analyst", "data-engineer", "data-scientist"]),
    P("business-analyst", "Business Analyst", "data", 860, [
      ["reqanalysis", .78], ["brd", .66], ["sql", .58], ["communication", .62], ["jira", .49], ["excel", .52],
      ["english", .47, "uu-tien"], ["powerbi", .35, "uu-tien"], ["teamwork", .40, "uu-tien"], ["statistics", .18, "uu-tien"]
    ], ["data-analyst"]),
    P("data-engineer", "Data Engineer", "data", 640, [
      ["python", .84], ["sql", .86], ["airflow", .58], ["spark", .55], ["cloud", .62], ["datamodel", .48],
      ["dbt", .41, "uu-tien"], ["bigquery", .44, "uu-tien"], ["git", .50], ["english", .38, "uu-tien"]
    ], ["data-analyst", "data-scientist"]),
    P("data-scientist", "Data Scientist", "data", 410, [
      ["python", .91], ["ml", .83], ["statistics", .78], ["sql", .70], ["pandas", .66], ["cloud", .32, "uu-tien"],
      ["spark", .28, "uu-tien"], ["english", .45, "uu-tien"], ["communication", .40, "uu-tien"], ["git", .42]
    ], ["data-analyst", "data-engineer"]),
    P("digital-marketing", "Digital Marketing Executive", "marketing", 950, [
      ["metaads", .72], ["googleads", .64], ["content", .61], ["ga4", .55], ["seo", .48], ["excel", .44],
      ["communication", .42, "uu-tien"], ["english", .35, "uu-tien"], ["adobe", .22, "uu-tien"]
    ], ["data-analyst"]),
    P("accountant", "Kế toán tổng hợp", "finance", 1340, [
      ["accounting", .90], ["tax", .76], ["misa", .58], ["excel", .80], ["ifrs", .24, "uu-tien"],
      ["english", .30, "uu-tien"], ["erp", .26, "uu-tien"], ["communication", .25, "uu-tien"]
    ], []),
    P("logistics-coordinator", "Logistics Coordinator", "logistics", 520, [
      ["incoterms", .74], ["supplychain", .62], ["english", .68], ["excel", .70], ["erp", .45],
      ["communication", .40, "uu-tien"], ["teamwork", .30, "uu-tien"]
    ], []),
    P("ux-designer", "UI/UX Designer", "design", 220, [
      ["figma", .88], ["prototyping", .70], ["uxresearch", .62], ["adobe", .40, "uu-tien"],
      ["communication", .45], ["english", .36, "uu-tien"], ["teamwork", .30, "uu-tien"]
    ], [])
  ];

  /* ---------- Cụm kỹ năng đi kèm (Market Trends) ---------- */
  const clusters = {
    data: [
      { name: "Cụm nền tảng", color: "navy", skills: ["sql", "python", "git"] },
      { name: "Cụm BI & Báo cáo", color: "warm", skills: ["powerbi", "tableau", "excel", "communication"] },
      { name: "Cụm khoa học dữ liệu", color: "teal", skills: ["statistics", "ml", "pandas"] },
      { name: "Cụm kỹ thuật dữ liệu", color: "slate", skills: ["dbt", "airflow", "bigquery", "spark", "cloud"] }
    ],
    marketing: [
      { name: "Cụm quảng cáo trả phí", color: "warm", skills: ["metaads", "googleads", "ga4"] },
      { name: "Cụm nội dung & SEO", color: "teal", skills: ["content", "seo", "adobe"] },
      { name: "Cụm phân tích", color: "navy", skills: ["excel", "communication"] }
    ],
    finance: [
      { name: "Cụm kế toán lõi", color: "navy", skills: ["accounting", "tax", "misa"] },
      { name: "Cụm quốc tế", color: "teal", skills: ["ifrs", "english"] },
      { name: "Cụm công cụ", color: "warm", skills: ["excel", "erp"] }
    ],
    logistics: [
      { name: "Cụm vận hành", color: "navy", skills: ["supplychain", "erp", "excel"] },
      { name: "Cụm xuất nhập khẩu", color: "teal", skills: ["incoterms", "english", "communication"] }
    ],
    design: [
      { name: "Cụm thiết kế giao diện", color: "teal", skills: ["figma", "prototyping", "adobe"] },
      { name: "Cụm nghiên cứu", color: "navy", skills: ["uxresearch", "communication", "teamwork"] }
    ]
  };

  /* ---------- Tài nguyên học (đội ngũ tuyển chọn — placeholder) ---------- */
  function resources(id) {
    const n = skills[id].name;
    return [
      { title: `Khóa nhập môn ${n} (placeholder)`, kind: "Khóa học", hours: Math.round(skills[id].hours * .5) },
      { title: `Bộ bài tập thực hành ${n}`, kind: "Bài tập", hours: Math.round(skills[id].hours * .3) },
      { title: `Tài liệu chính thức / cheat sheet ${n}`, kind: "Tài liệu", hours: Math.max(2, Math.round(skills[id].hours * .2)) }
    ];
  }

  return { meta, industries, types, levels, locations, skills, positions, clusters, resources };
})();
