package mil.af.domain;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "ALR20_CONTEST_INFO")
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
@Builder
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class alr20_contest_info {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "CONTEST_INFO_ID")
    private Long id;

    /** 공모전 명칭 */
    @Column(name = "CONTEST_NAME", nullable = false, length = 100)
    @NotNull
    private String contestName;

    /** 공모전 설명/안내사항 */
    @Column(name = "DESCRIPTION", columnDefinition = "TEXT")
    private String description;

    /** 접수 시작일 */
    @Column(name = "APPLICATION_START_DATE", nullable = false)
    @NotNull
    private LocalDate applicationStartDate;

    /** 접수 종료일 */
    @Column(name = "APPLICATION_END_DATE", nullable = false)
    @NotNull
    private LocalDate applicationEndDate;

    /** 대회 시작일 */
    @Column(name = "CONTEST_START_DATE", nullable = false)
    @NotNull
    private LocalDate contestStartDate;

    /** 대회 종료일 */
    @Column(name = "CONTEST_END_DATE", nullable = false)
    @NotNull
    private LocalDate contestEndDate;

    /** 활성화 여부 (현재 진행 중인 공모전) */
    @Column(name = "ACTIVE", nullable = false)
    @Builder.Default
    private Boolean active = true;

    @CreatedDate
    @Column(name = "CREATED_DATE", nullable = false, updatable = false)
    private LocalDateTime createdDate;

    @LastModifiedDate
    @Column(name = "MODIFIED_DATE")
    private LocalDateTime modifiedDate;
}
