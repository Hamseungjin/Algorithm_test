package mil.af.domain;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "ALR20_COPYRIGHT_CONSENT")
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
@Builder
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class alr20_copyright_consent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "COPYRIGHT_CONSENT_ID")
    private Long id;

    /** 동의 여부 */
    @Column(name = "AGREED", nullable = false)
    @NotNull
    private Boolean agreed;

    /** 동의 원본 파일명 */
    @Column(name = "ORIG_FILE_NAME", nullable = false, length = 255)
    @NotNull
    private String origFileName;

    /** 서버 저장 파일명 */
    @Column(name = "STORED_FILE_NAME", nullable = false, length = 255)
    @NotNull
    private String storedFileName;

    /** 파일 저장 경로 */
    @Column(name = "FILE_PATH", nullable = false, length = 500)
    @NotNull
    private String filePath;

    /** 파일 크기 (bytes) */
    @Column(name = "FILE_SIZE", nullable = false)
    @NotNull
    private Long fileSize;

    @CreatedDate
    @Column(name = "AGREED_DATE", nullable = false, updatable = false)
    private LocalDateTime agreedDate;
}
