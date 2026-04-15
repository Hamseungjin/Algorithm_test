package mil.af.domain;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "ALR20_TEAM")
@Getter
@Setter
@Builder
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class alr20_team {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "TEAM_ID")
    private Long id;

    @Column(name = "TEAM_NAME", nullable = false, length = 20, unique = true)
    @NotNull
    private String teamName;

    @Column(name = "USER_ID", nullable = false, length = 15, unique = true)
    @NotNull
    private String userId;

    @Column(name = "PASSWORD", nullable = false, length = 255)
    @NotNull
    private String password;

    @OneToMany(mappedBy = "team", fetch = FetchType.LAZY,
               cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<alr20_member> memberList = new ArrayList<>();
}
