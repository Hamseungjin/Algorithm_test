package mil.af.domain;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "ALR20_APPLICATION")
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
@Builder
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class alr20_application {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "APPLICATION_ID")
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(name = "CONTEST_FIELD", nullable = false, length = 50)
    @NotNull
    private ContestField contestField;

    @Column(name = "PROJECT_NAME", nullable = false, length = 100)
    @NotNull
    private String projectName;

    @OneToOne(fetch = FetchType.LAZY, orphanRemoval = true)
    @JoinColumn(name = "TEAM_ID", nullable = false)
    private alr20_team team;

    @OneToOne(fetch = FetchType.LAZY, orphanRemoval = true)
    @JoinColumn(name = "PERSONAL_INFO_CONSENT_ID", nullable = false)
    private alr20_personalinfo_consent personalInfoConsent;

    @OneToOne(fetch = FetchType.LAZY, orphanRemoval = true)
    @JoinColumn(name = "COPYRIGHT_CONSENT_ID", nullable = false)
    private alr20_copyright_consent copyrightConsent;

    @OneToOne(fetch = FetchType.LAZY, orphanRemoval = true)
    @JoinColumn(name = "IDEA_PLAN_FILE_ID", nullable = false)
    private alr20_idea_plan_file ideaPlanFile;

    @OneToOne(fetch = FetchType.LAZY, orphanRemoval = true)
    @JoinColumn(name = "IDEA_SUMMARY_FILE_ID", nullable = false)
    private alr20_idea_summary_file ideaSummaryFile;

    @OneToOne(fetch = FetchType.LAZY, orphanRemoval = true)
    @JoinColumn(name = "SURVEY_ID", nullable = false)
    private alr20_survey survey;

    @CreatedDate
    @Column(name = "CREATED_DATE", nullable = false, updatable = false)
    private LocalDateTime createdDate;

    @LastModifiedDate
    @Column(name = "MODIFIED_DATE")
    private LocalDateTime modifiedDate;

    public enum ContestField {
        FREE,       // 자유공모
        DESIGNATED  // 지정공모
    }
}
